import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Rect, Circle, Ellipse, RegularPolygon, Text, Group } from "react-konva";
import { FaPen, FaEraser, FaSquareFull, FaCircle, FaRegStickyNote, FaUndo, FaTrash, FaArrowRight, FaEllipsisH, FaUserCircle, FaDownload } from "react-icons/fa";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";
import { useWorkspace } from "../../context/WorkspaceContext";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Setup socket
const socket = io(BACKEND_URL, {
  transports: ["websocket", "polling"],
  withCredentials: true,
});

const TOOL_ICONS = [
  { tool: "pen", icon: <FaPen size={26} color="#1865c1" />, label: "Pen" },
  { tool: "eraser", icon: <FaEraser size={26} color="#999" />, label: "Eraser" },
  { tool: "rect", icon: <FaSquareFull size={26} color="#43d96a"/>, label: "Rectangle" },
  { tool: "ellipse", icon: <FaEllipsisH size={26} color="#ffbb33"/>, label: "Ellipse" },
  { tool: "circle", icon: <FaCircle size={26} color="#db2244"/>, label: "Circle" },
  { tool: "sticky", icon: <FaRegStickyNote size={26} color="#ffd933"/>, label: "Sticky Note" },
  { tool: "arrow", icon: <FaArrowRight size={26} color="#7b337e"/>, label: "Arrow" },
];

const STICKY_COLORS = ["#fff9b1", "#e7ffe6", "#e1eeff", "#ffedfa", "#ffe8e7", "#f7dd2b", "#ffbb33", "#ffa047", "#ff5528", "#db2244", "#aa1c72", "#7b337e", "#420D4B", "#210635"];

function CircularColorPicker({ value, onChange, show, position = { right: 32, top: "46%" } }) {
  // Attractive circular color picker
  const COLORS = STICKY_COLORS;
  const r = 60;
  if (!show) return null;
  return (
    <div className="fixed z-50" style={{ right: position.right, top: position.top, transform: 'translateX(-50%)' }}>
      <div className="relative backdrop-blur-md bg-white/40 rounded-full flex items-center justify-center p-4 shadow-lg w-[140px] h-[140px]"
       style={{ position: "relative", width: 2 * r + 44, height: 2 * r + 44 }}>
        {COLORS.map((col, i) => {
          const angle = (i / COLORS.length) * 2 * Math.PI;
          const cx = r + Math.cos(angle) * r;
          const cy = r + Math.sin(angle) * r;
          return (
            <button
              key={col}
              className={clsx("rounded-full border-2 border-white shadow", value === col && "ring-2 ring-offset-2 ring-gray-500")}
              style={{
                background: col,
                width: 34,
                height: 34,
                position: "absolute",
                left: cx,
                top: cy,
                transition: "box-shadow 0.15s"
              }}
              title={col}
              onClick={() => onChange(col)}
            />
          );
        })}
      </div>
    </div>
  );
}

const StrokeWidthSlider = ({ value, onChange, show }) => {
  if (!show) return null;
  return (
    <div className="fixed z-50 flex items-center gap-2 p-3 bg-white/50 backdrop-blur-md shadow-lg rounded-full bottom-12 left-1/2" style={{ left:200,
        top: "20",
         }}>
      
      <input
        type="range"
        min="1"
        max="12"
        value={value}
        className="accent-[#7B337E] w-32"
        onChange={e => onChange(Number(e.target.value))}
        title="Stroke Width"
      />
      <span className="text-sm">{value}</span>
    </div>
  );
};

function StickyNoteInputModal({ show, onClose, onCreate }) {
  const [text, setText] = useState("");
  const [color, setColor] = useState(STICKY_COLORS[0]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/30 z-[200] flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl min-w-[300px] flex flex-col gap-3 items-center">
        <h4 className="font-bold text-lg mb-2">Add Sticky Note</h4>
        <textarea
          className="border px-2 py-1 rounded-md w-full"
          placeholder="Enter note text..."
          rows={3}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {STICKY_COLORS.map(c =>
            <button key={c} type="button"
              style={{ background: c, width: 28, height: 28 }}
              className={clsx("rounded-full border-2 border-white shadow", color === c && "ring-2 ring-offset-2 ring-[#7B337E]")}
              onClick={() => setColor(c)}
            />
          )}
        </div>
        <div className="flex gap-3 mt-4 justify-center">
          <button
            className="bg-[#7b337e] text-white px-4 py-1 rounded shadow active:scale-95"
            disabled={!text.trim()}
            onClick={() => {
              if (text.trim()) {
                onCreate(text.trim(), color);
                setText("");
                onClose();
              }
            }}
          >
            Add Note
          </button>
          <button className="bg-gray-200 rounded px-4 py-1" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function Whiteboard() {
  const { activeWorkspaceId, setActiveWorkspaceId, workspaces } = useWorkspace();
  const [lines, setLines] = useState([]);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const stageRef = useRef();
  const [drawing, setDrawing] = useState(false);
  const [stickies, setStickies] = useState([]);
  const [stickyInput, setStickyInput] = useState(false);
  const [pendingSticky, setPendingSticky] = useState(null);

  // Always call hooks, even if not rendering main UI
  useEffect(() => {
    if (!activeWorkspaceId) return;
    socket.emit("joinRoom", activeWorkspaceId);
    const handleSyncLines = (newLines) => setLines(newLines);
    socket.on("syncLines", handleSyncLines);
    const handleSyncStickies = (newStickies) => setStickies(newStickies);
    socket.on("syncStickies", handleSyncStickies);
    return () => {
      socket.off("syncLines", handleSyncLines);
      socket.emit("leaveWorkspace", activeWorkspaceId);
    
  };
  }, [activeWorkspaceId]);

  // Workspace selection modal style
  if (!activeWorkspaceId) {
    return (
      <div className="flex  justify-center items-center min-h-screen bg-gradient-to-tr from-[#F5D5E0] to-[#7B337E] p-6">
        <div className="rounded-xl p-8 shadow-xl bg-white flex flex-col items-center gap-6">
          <h2 className="font-bold text-3xl text-[#7B337E] mb-6 animate-bounce">
            Select a workspace to start drawing
          </h2>
          <div className="grid grid-cols gap-6">
          {workspaces.map(ws => (
            <button
              key={ws.id}
              className="flex items-center gap-2 p-4 rounded-xl bg-gradient-to-tr from-[#fff] to-[#f0f0f0] shadow hover:scale-105 transition-transform"
              onClick={() => setActiveWorkspaceId(ws.id)}
            >
              <FaUserCircle size={24} className="text-[#7B337E]" />
              <span className="font-semibold">{ws.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  }
  // Drawing events
  const handleMouseDown = (e) => {
    if (!activeWorkspaceId) return;
    const pos = stageRef.current.getPointerPosition();
    setDrawing(true);

    if (["pen", "eraser", "arrow"].includes(tool)) {
      const newLine = {
        tool,
        color: tool === "eraser" ? "#fff" : color,
        strokeWidth,
        points: [pos.x, pos.y],
      };
      setLines(prev => [...prev, newLine]);
      socket.emit("draw", { workspaceId: activeWorkspaceId, line: newLine });
    } else if (["rect", "circle", "ellipse", "triangle"].includes(tool)) {
      const shape = {
        id: uuidv4(), tool, color, strokeWidth, x: pos.x, y: pos.y, width: 0, height: 0,
      };
      setLines(prev => [...prev, shape]);
    } else if (tool === "sticky") {
      // If sticky tool, show input if not pending
      if (!pendingSticky) {
        setStickyInput(true);
        setDrawing(false);
      } else {
        const { text, color: noteColor } = pendingSticky;
        const sticky = {
          id: uuidv4(),
          x: pos.x,
          y: pos.y,
          text,
          width: 150,
          height: 70,
          color: noteColor,
        };
        socket.emit("addSticky", { workspaceId: activeWorkspaceId, sticky });
        setPendingSticky(null);
        setStickyInput(false);
      }
    }
  };

  // Mouse move: update shape/line
  const handleMouseMove = (e) => {
    if (!drawing) return;
    const pos = stageRef.current.getPointerPosition();
    setLines(prevLines => {
      const last = prevLines[prevLines.length - 1];
      if (!last) return prevLines;
      let updatedLast;
      if (["pen", "eraser", "arrow"].includes(last.tool)) {
        updatedLast = { ...last, points: [...last.points, pos.x, pos.y] };
        socket.emit("draw", { workspaceId: activeWorkspaceId, line: updatedLast });
      } else if (["rect", "circle", "ellipse", "triangle"].includes(last.tool)) {
        updatedLast = { ...last, width: pos.x - last.x, height: pos.y - last.y };
      }
      return [...prevLines.slice(0, -1), updatedLast];
    });
  };

  const handleMouseUp = () => {
    setDrawing(false);
    if (!activeWorkspaceId) return;
    const last = lines[lines.length - 1];
    if (last && ["rect", "circle", "ellipse", "triangle"].includes(last.tool)) {
      socket.emit("draw", { workspaceId: activeWorkspaceId, line: last });
    }
  };

  const handleUndo = () => {
    setLines(prev => prev.slice(0, -1));
    socket.emit("undo", { workspaceId: activeWorkspaceId });
  };

  const handleClear = () => {
    setLines([]);
    setStickies([]);
    socket.emit("clear", { workspaceId: activeWorkspaceId });
  };

  const handleExport = () => {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = uri;
    link.click();
  };

  // Sticky Notes: Drag, Edit
  const onStickyDrag = (id, e) => {
    setStickies(stickies.map(st =>
      st.id === id ? { ...st, x: e.target.x(), y: e.target.y() } : st
    ));
  };
  const onStickyTextChange = (id, val) => {
    setStickies(stickies.map(st =>
      st.id === id ? { ...st, text: val } : st
    ));
  };

  // Layout constants
  const CANVAS_HEIGHT = window.innerHeight - 72;
  const CANVAS_WIDTH = window.innerWidth;

  // Toolbar
  const toolbar = (
   
  <div className="fixed z-50 top-8 left-4 flex flex-col items-center  gap-6 bg-white/50 backdrop-blur-md rounded-xl p-3 shadow-md">

      {TOOL_ICONS.map(({ tool: t, icon, label }) => (
        <button
          key={t}
          className={clsx(
          "rounded-xl p-3 transition-transform duration-150 hover:scale-110",
          tool === t ? "bg-[#7B337E] text-white shadow-lg" : "hover:bg-slate-200"
        )}
          title={label}
          onClick={() => {
            setTool(t);
            if (t === "sticky") setStickyInput(true);
          }}
        >{icon}</button>
      ))}
      <button title="Undo" className="rounded-xl p-3 hover:bg-slate-200" onClick={handleUndo}><FaUndo size={28} /></button>
      <button title="Clear" className="rounded-xl p-3 hover:bg-slate-200" onClick={handleClear}><FaTrash size={28} /></button>
      <button title="Export" className="rounded-xl p-3 hover:bg-slate-200" onClick={handleExport}><FaDownload size={28}/></button>
    </div>
  );

  return (
    <div className="whiteboard relative w-full h-screen bg-[#F5F5FB] ">
      {toolbar}
      {/* Circular Color Picker & Stroke Width at bottom center */}
      <CircularColorPicker value={color} onChange={setColor} show={["pen", "rect", "ellipse", "circle", "triangle", "arrow"].includes(tool)} position={{ right: 32, top: "46%" }}/>
      <StrokeWidthSlider value={strokeWidth} onChange={setStrokeWidth} show={["pen", "rect", "ellipse", "circle", "triangle", "arrow"].includes(tool)} position="right"/>
      {/* Sticky note input modal */}
      <StickyNoteInputModal
        show={tool === "sticky" && stickyInput && !pendingSticky}
        onClose={() => setStickyInput(false)}
        onCreate={(text, noteColor) => setPendingSticky({ text, color: noteColor })}
      />
      {/* Rainbow color bar */}
      <div className="fixed bottom-0 left-0 w-full h-8 flex items-center justify-center z-20" style={{ background: "linear-gradient(90deg, #294E9D, #21b573, #FFD933, #FF4040, #7b337e,#210635)" }} />
      {/* Actual canvas */}
      <Stage
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
        style={{
          background: "#f8f9fa",
        }}
      >
        {/* Draw grid */}
        <Layer listening={false}>
          {/* Vertical lines */}
          {Array.from({ length: Math.ceil(CANVAS_WIDTH / 36) }, (_, i) =>
            <Line key={`gv${i}`} points={[i * 36, 0, i * 36, CANVAS_HEIGHT]} stroke="#e2e8f0" strokeWidth={1} opacity={0.7} />
          )}
          {/* Horizontal lines */}
          {Array.from({ length: Math.ceil(CANVAS_HEIGHT / 36) }, (_, i) =>
            <Line key={`gh${i}`} points={[0, i * 36, CANVAS_WIDTH, i * 36]} stroke="#e2e8f0" strokeWidth={1} opacity={0.7} />
          )}
        </Layer>
        <Layer>
          {lines.map((line, i) => {
            if (["pen", "eraser", "arrow"].includes(line.tool)) {
              return (
                <Line
                  key={i}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  lineCap="round"
                  lineJoin="round"
                  tension={0.5}
                  globalCompositeOperation={line.tool === "eraser" ? "destination-out" : "source-over"}
                  pointerLength={line.tool === "arrow" ? 12 : 0}
                />
              );
            } else if (line.tool === "rect") {
              return (
                <Rect
                  key={i}
                  x={line.x}
                  y={line.y}
                  width={line.width}
                  height={line.height}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                  cornerRadius={8}
                />
              );
            } else if (line.tool === "circle") {
              return (
                <Circle
                  key={i}
                  x={line.x + line.width / 2}
                  y={line.y + line.height / 2}
                  radius={Math.sqrt(line.width ** 2 + line.height ** 2) / 2}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                />
              );
            } else if (line.tool === "ellipse") {
              return (
                <Ellipse
                  key={i}
                  x={line.x + line.width / 2}
                  y={line.y + line.height / 2}
                  radiusX={Math.abs(line.width / 2)}
                  radiusY={Math.abs(line.height / 2)}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                />
              );
            } else if (line.tool === "triangle") {
              return (
                <RegularPolygon
                  key={i}
                  x={line.x + line.width / 2}
                  y={line.y + line.height / 2}
                  sides={3}
                  radius={Math.max(Math.abs(line.width), Math.abs(line.height)) / 2}
                  rotation={180}
                  stroke={line.color}
                  strokeWidth={line.strokeWidth}
                />
              );
            }
            return null;
          })}
          {/* Sticky notes */}
          {stickies.map(sticky => (
            <Group
              key={sticky.id}
              x={sticky.x}
              y={sticky.y}
              draggable
              onDragEnd={e => onStickyDrag(sticky.id, e)}
            >
              <Rect
                width={sticky.width}
                height={sticky.height}
                fill={sticky.color}
                cornerRadius={12}
                shadowBlur={6}
                shadowOffset={{ x: 2, y: 2 }}
                shadowColor="#cab8"
              />
              {/* Delete Button */}
    <Text
      text="✕"
      x={sticky.width - 20}
      y={4}
      fontSize={16}
      fill="#ff0000"
      onClick={() => {
    setStickies(prev => prev.filter(st => st.id !== sticky.id));
    socket.emit("removeSticky", { workspaceId: activeWorkspaceId, stickyId: sticky.id });
  }}
      style={{ cursor: "pointer" }}
    />

              <Text
                text={sticky.text}
                x={12}
                y={16}
                width={sticky.width - 16}
                height={sticky.height - 20}
                fontSize={18}
                draggable={false}
                align="center"
                verticalAlign="middle"
                fill="#333"
                fontStyle="bold"
                onDblClick={() => {
                  const val = prompt("Edit sticky note text", sticky.text);
                  if (val !== null) onStickyTextChange(sticky.id, val);
                }}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
