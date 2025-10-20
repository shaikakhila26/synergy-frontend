import React, { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../AuthProvider.jsx";
import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from "y-prosemirror";

// TipTap extensions
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";

// MUI
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import FormatBold from "@mui/icons-material/FormatBold";
import FormatItalic from "@mui/icons-material/FormatItalic";
import FormatUnderlined from "@mui/icons-material/FormatUnderlined";
import Title from "@mui/icons-material/Title";
import FormatListBulleted from "@mui/icons-material/FormatListBulleted";
import FormatListNumbered from "@mui/icons-material/FormatListNumbered";

// Helper: Random color for avatar background
const AVATAR_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#7B337E"
];
const getRandomColor = () =>
  AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

export default function DocumentEditor({ userName = "Anonymous" }) {
  const { user, authChecked } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [docTitle, setDocTitle] = useState("");
  const [collaborators, setCollaborators] = useState([]);
  const editorRef = useRef();
  const ydocRef = useRef(null);
  const providerRef = useRef(null);

  // Fetch workspaces the user is a member of
  useEffect(() => {
    if (!authChecked || !user?.id) return;
    const fetchWorkspaces = async () => {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspace_id, workspaces(name)")
        .eq("user_id", user.id)
        .order("workspace_id", { ascending: true });
      if (!error) {
        setWorkspaces(
          data.map((d) => ({ id: d.workspace_id, name: d.workspaces.name }))
        );
      }
    };
    fetchWorkspaces();
  }, [authChecked, user]);

  // Fetch documents for selected workspace
  useEffect(() => {
    if (!selectedWorkspace?.id) return;
    const fetchDocuments = async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("workspace_id", selectedWorkspace.id)
        .order("created_at", { ascending: false });
      if (!error) setDocuments(data);
    };
    fetchDocuments();
  }, [selectedWorkspace]);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: "",
    onUpdate: async ({ editor }) => {
      if (!selectedDocument?.id || !ydocRef.current) return;
      const htmlContent = editor.getHTML();
      const snapshot = Y.encodeStateAsUpdate(ydocRef.current);
      await supabase
        .from("documents")
        .update({ content: htmlContent, snapshot, updated_at: new Date() })
        .eq("id", selectedDocument.id);
    },
  });

  useEffect(() => {
  if (!selectedDocument?.id || !editor) return;

  // Disconnect previous provider if any
  if (providerRef.current) {
    providerRef.current.disconnect();
    ydocRef.current.destroy && ydocRef.current.destroy();
  }

  const ydoc = new Y.Doc();
  ydocRef.current = ydoc;

  const provider = new WebsocketProvider(
    "wss://synergy-backend-6nv1.onrender.com/yjs",
    selectedDocument.id,
    ydoc
  );
  providerRef.current = provider;

  const yXmlFragment = ydoc.getXmlFragment("tiptap");

  // --- REGISTER PLUGINS HERE ---
  editor.registerPlugin(ySyncPlugin(yXmlFragment));
  editor.registerPlugin(yCursorPlugin(provider.awareness));
  editor.registerPlugin(yUndoPlugin());
  // ----------------------------

  // Load snapshot from Supabase if exists
  (async () => {
    const { data } = await supabase
      .from("documents")
      .select("snapshot")
      .eq("id", selectedDocument.id)
      .single();

    let snapshotUint8 = null;
    if (data?.snapshot) {
      if (data.snapshot instanceof Uint8Array) snapshotUint8 = data.snapshot;
      else if (Array.isArray(data.snapshot)) snapshotUint8 = new Uint8Array(data.snapshot);
      else if (typeof data.snapshot === "string") {
        const hex = data.snapshot.startsWith("\\x") ? data.snapshot.slice(2) : data.snapshot;
        snapshotUint8 = new Uint8Array(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
      }
      try { Y.applyUpdate(ydoc, snapshotUint8); }
      catch { if (selectedDocument.content) editor.commands.setContent(selectedDocument.content); }
    } else if (selectedDocument.content) editor.commands.setContent(selectedDocument.content);
  })();

  // Awareness
  const color = getRandomColor();
  provider.awareness.setLocalStateField("user", { name: userName, color });
  const updateCollaborators = () => {
    const users = Array.from(provider.awareness.getStates().values())
      .map((s) => s.user)
      .filter(Boolean);
    setCollaborators(users);
  };
  provider.awareness.on("update", updateCollaborators);
  updateCollaborators();

  return () => {
    provider.disconnect();
    ydoc.destroy();
    providerRef.current = null;
    ydocRef.current = null;
  };
}, [selectedDocument?.id, editor, userName]);


  // Create new document
  const createDocument = async () => {
    if (!selectedWorkspace?.id || !docTitle.trim()) return;
    const newDocY = new Y.Doc();
    const snapshot = Y.encodeStateAsUpdate(newDocY);
    const { data, error } = await supabase
      .from("documents")
      .insert([{ title: docTitle, workspace_id: selectedWorkspace.id, snapshot }])
      .select()
      .single();
    if (!error) {
      setDocuments((prev) => [data, ...prev]);
      setSelectedDocument(data);
      setDocTitle("");
    }
  };

  // Upload document
  const uploadDocument = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedWorkspace?.id) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      const newDocY = new Y.Doc();
      const snapshot = Y.encodeStateAsUpdate(newDocY);
      const { data, error } = await supabase
        .from("documents")
        .insert([{ title: file.name, workspace_id: selectedWorkspace.id, content, snapshot }])
        .select()
        .single();
      if (!error) {
        setDocuments((prev) => [data, ...prev]);
        setSelectedDocument(data);
      }
    };
    reader.readAsText(file);
  };

  // 1. Workspace selector
  if (!authChecked) return <div>Checking authentication...</div>;
  if (!user) return <div>Please log in to access documents.</div>;
  if (!selectedWorkspace) {
    return (
      <div style={{ padding: "2rem 0", maxWidth: 460, margin: "0 auto", background: "#fff", borderRadius: 11, boxShadow: "0 4px 26px #0001" }}>
        <h2 style={{ margin: "0 0 1.5rem 0", color: "#2c296b" }}>
          <PeopleAltIcon style={{ verticalAlign: "middle", marginRight: 8, color: "#2196F3" }} />
          Select a Workspace
        </h2>
        {workspaces.length === 0 && <p style={{ color: "#888" }}>You are not a member of any workspace</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {workspaces.map((ws) => (
            <Button
              key={ws.id}
              variant="outlined"
              size="large"
              onClick={() => setSelectedWorkspace(ws)}
              startIcon={<PeopleAltIcon />}
              sx={{ borderRadius: "2rem", fontWeight: 600, textTransform: "none", mb: 1, boxShadow: "0 1px 4px #0001" }}
            >
              {ws.name}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // 2. Document selection panel
  if (!selectedDocument) {
    return (
      <div style={{ padding: "2rem 0", maxWidth: 680, margin: "0 auto", background: "#fff", borderRadius: 14, boxShadow: "0 4px 26px #0001" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <Tooltip title="Back to workspace selection">
            <IconButton onClick={() => setSelectedWorkspace(null)}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <h3 style={{ marginLeft: 8, color: "#012", fontWeight: 700, fontSize: 22 }}>
            <InsertDriveFileIcon fontSize="small" style={{ verticalAlign: "text-bottom", color: "#D03CFC" }} /> Documents in "{selectedWorkspace.name}"
          </h3>
        </div>
        <div style={{ display: "flex", gap: 7, alignItems: "flex-end", marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Enter document title"
            value={docTitle}
            onChange={e => setDocTitle(e.target.value)}
            style={{
              fontSize: 18, padding: "9px 15px", borderRadius: 8, border: "1.5px solid #eee", outline: "none"
            }}
          />
          <Button
            onClick={createDocument}
            startIcon={<AddCircleIcon />}
            variant="contained"
            sx={{ borderRadius: 8, background: "#D03CFC" }}
            disabled={!docTitle.trim()}
          >New</Button>
          <label>
            <input hidden type="file" accept=".txt,.md" onChange={uploadDocument} />
            <Tooltip title="Upload document">
              <IconButton sx={{ ml: 1, color: "#1ABC9C" }} component="span">
                <UploadFileIcon /> 
              </IconButton>
            </Tooltip>
          </label>
        </div>
        {documents.length === 0 && <p>No documents yet</p>}
        <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
          {documents.map((doc) => (
            <Button
              key={doc.id}
              sx={{
                borderRadius: 8,
                justifyContent: "flex-start",
                background: "#f4ecff",
                color: "#1B1464",
                boxShadow: "0 1px 5px #e6d7ff",
                fontWeight: 600,
                fontSize: 18,
                pl: 2, py: 1,
                mb: 1,
                transition: "transform 0.09s"
              }}
              onClick={() => setSelectedDocument(doc)}
              startIcon={<InsertDriveFileIcon style={{ color: "#9C27B0" }} />}
            >
              {doc.title || "Untitled Document"}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // 3. Main Editor UI
  if (!editor) return <div>Loading editor...</div>;
  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#FAFBFC" }}>
      {/* Top bar - document title, icons, avatars */}
      <div style={{
        boxShadow: "0 2px 8px #0001",
        display: "flex", alignItems: "center",
        background: "white", padding: "10px 22px", borderRadius: "0 0 14px 14px",
        position: "sticky", top: 0, zIndex: 12, marginBottom: 16
      }}>
        <Tooltip title="Back to documents">
          <IconButton onClick={() => setSelectedDocument(null)}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <InsertDriveFileIcon style={{ marginRight: 10, color: "#D03CFC" }} />
        <input
          type="text"
          value={selectedDocument?.title || ""}
          onChange={e => {
            setSelectedDocument({ ...selectedDocument, title: e.target.value });
            supabase.from("documents").update({ title: e.target.value }).eq("id", selectedDocument.id);
          }}
          style={{
            border: "none", background: "transparent", fontWeight: 700, fontSize: 18, outline: "none",
            color: "#1A2936", minWidth: 120, marginRight: 8
          }}
        />
        <div style={{ flex: 1 }} />
        {/* Collaborator Avatars */}
        {collaborators.map((c, idx) => (
          <Tooltip title={c.name} key={idx} arrow>
            <Avatar
              sx={{
                bgcolor: c.color || "#F59E0B",
                width: 32, height: 32, fontWeight: 700, fontSize: "1.05rem",
                boxShadow: "0 2px 8px #0003",
                ml: idx ? -1.5 : 0, border: '2px solid #fff'
              }}
            >
              {c.name?.[0]?.toUpperCase() || "?"}
            </Avatar>
          </Tooltip>
        ))}
      </div>
      {/* Editor area */}
      <div style={{ maxWidth: 800, margin: "0 auto", background: "white", borderRadius: 20, boxShadow: "0 6px 26px #8d48d015", padding: 26 }}>
        {/* Section headers */}
        <div style={{ marginBottom: 18, borderBottom: `2px solid #D03CFC16`, paddingBottom: 8 }}>
          <h2 style={{ fontWeight: 700, color: "#9C27B0", letterSpacing: 0.5, margin: 0 }}>
            <InsertDriveFileIcon style={{ color: "#D03CFC", marginBottom: -4, marginRight: 5 }} />
            Document Editor
          </h2>
          
        </div>
        {/* Toolbar */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <Tooltip title="Bold (Ctrl+B)">
            <IconButton onClick={() => editor.chain().focus().toggleBold().run()}><FormatBold /></IconButton>
          </Tooltip>
          <Tooltip title="Italic (Ctrl+I)">
            <IconButton onClick={() => editor.chain().focus().toggleItalic().run()}><FormatItalic /></IconButton>
          </Tooltip>
          <Tooltip title="Underline (Ctrl+U)">
            <IconButton onClick={() => editor.chain().focus().toggleUnderline().run()}><FormatUnderlined /></IconButton>
          </Tooltip>
          <Tooltip title="Heading">
            <IconButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Title fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="• Bullet List">
            <IconButton onClick={() => editor.chain().focus().toggleBulletList().run()}><FormatListBulleted /></IconButton>
          </Tooltip>
          <Tooltip title="1. Numbered List">
            <IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()}><FormatListNumbered /></IconButton>
          </Tooltip>
        </div>
        {/* Collaborative editor */}
        <div style={{
          minHeight: 300,
          padding: "18px 18px 28px 18px",
          border: `1.5px solid #D03CFC40`,
          borderRadius: 11,
          boxShadow: "0 2px 16px #ddd5",
          fontSize: 17,
          background: "#FFFBFF"
        }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}






// src/components/DocumentEditor.jsx
/*import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../../supabaseClient";
import { useWorkspace } from "../../context/WorkspaceContext.jsx";

import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";




export default function DocumentEditor({ docId , userName= "Anonymous" }) {
    const { activeWorkspace } = useWorkspace();
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const editor = useEditor({
    extensions: [StarterKit,
    Bold,
    Italic,
    Underline,
    Heading.configure({ levels: [1, 2, 3] }),
    BulletList,
    OrderedList,
    ListItem,
],
    content: "",
    onUpdate({ editor }) {
      if (!docId) return;
      supabase
        .from("documents")
        .update({ content: editor.getHTML(), updated_at: new Date() })
        .eq("id", docId);
    },
  });

  useEffect(() => {
    if (!docId || !editor) return;

    const ydoc = new Y.Doc();
    const wsProvider = new WebsocketProvider("ws://localhost:1234", docId, ydoc);

    (async () => {
      const { data } = await supabase
        .from("documents")
        .select("snapshot")
        .eq("id", docId)
        .single();
      if (data?.snapshot) Y.applyUpdate(ydoc, data.snapshot);
    })();

    ydoc.on("update", async () => {
      await supabase
        .from("documents")
        .upsert({
          id: docId,
          snapshot: Y.encodeStateAsUpdate(ydoc),
          updated_at: new Date(),
        });
    });

    // ====== Awareness: track connected users ======
  const awareness = wsProvider.awareness;
  awareness.setLocalStateField("user", { name: "Your Name Here" }); // can use profile.name
  awareness.on("update", () => {
    const users = Array.from(awareness.getStates().values());
    console.log("Connected users:", users);
  });
  // ============================================

    return () => {
      wsProvider.disconnect();
      ydoc.destroy();
    };
  }, [docId, editor , userName]);

  

  if (!editor) return <div>Loading editor...</div>;
  return (
    <div>
     
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>Underline</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
      </div>

      
      <EditorContent editor={editor} />
    </div>
  );
}*/