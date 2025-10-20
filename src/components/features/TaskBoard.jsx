// src/components/features/TaskBoard.jsx
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "../../supabaseClient";
import TaskBoardSidebar from "../TaskBoard/TaskBoardSidebar";

export default function TaskBoard() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [lists, setLists] = useState([]);
  const [newTaskTitles, setNewTaskTitles] = useState({});
  const [newListTitle, setNewListTitle] = useState("");

  // Fetch lists when workspace changes
  useEffect(() => {
    if (!activeWorkspaceId) return;

    const fetchLists = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/taskboard/${activeWorkspaceId}`,
          { headers: { Authorization: `Bearer ${session?.access_token}` } }
        );
        const data = await res.json();
        const listsWithTasks = (data.lists || []).map(list => ({
          ...list,
          tasks: list.tasks || [],
        }));
        setLists(listsWithTasks);
      } catch (err) {
        console.error("Error fetching taskboard:", err);
        setLists([]);
      }
    };

    fetchLists();

    if (!window.socket) return;
    window.socket.emit("joinWorkspace", activeWorkspaceId);

    const handleListCreated = (list) => setLists(prev => [...prev, { ...list, tasks: [] }]);
    const handleTaskCreated = (task) => {
      setLists(prev =>
        prev.map(l => l.id === task.list_id ? { ...l, tasks: [...(l.tasks || []), task] } : l)
      );
    };
    const handleTasksReordered = (updates) => setLists(prev => applyTaskReorder(prev, updates));
    const handleTaskDeleted = ({ taskId, listId }) => {
      setLists(prev =>
        prev.map(l => l.id === listId ? { ...l, tasks: l.tasks.filter(t => t.id !== taskId) } : l)
      );
    };
    const handleListDeleted = ({ listId }) => setLists(prev => prev.filter(l => l.id !== listId));

    window.socket.on("task:list_created", handleListCreated);
    window.socket.on("task:task_created", handleTaskCreated);
    window.socket.on("task:tasks_reordered", handleTasksReordered);
    window.socket.on("task:task_deleted", handleTaskDeleted);
    window.socket.on("task:list_deleted", handleListDeleted);

    return () => {
      if (!window.socket) return;
      window.socket.off("task:list_created", handleListCreated);
      window.socket.off("task:task_created", handleTaskCreated);
      window.socket.off("task:tasks_reordered", handleTasksReordered);
      window.socket.off("task:task_deleted", handleTaskDeleted);
      window.socket.off("task:list_deleted", handleListDeleted);
    };
  }, [activeWorkspaceId]);

  function applyTaskReorder(prevLists, updates) {
    return prevLists.map(list => ({
      ...list,
      tasks: [...list.tasks].sort((a, b) => a.position - b.position)
    }));
  }

  async function onDragEnd(result) {
    if (!result.destination) return;
    const { source, destination } = result;
    const sourceListIndex = lists.findIndex(l => l.id === source.droppableId);
    const destListIndex = lists.findIndex(l => l.id === destination.droppableId);
    const newLists = [...lists];
    const [movedTask] = newLists[sourceListIndex].tasks.splice(source.index, 1);
    newLists[destListIndex].tasks.splice(destination.index, 0, movedTask);
    setLists(newLists);

    const updates = newLists.flatMap(list =>
      list.tasks.map((task, index) => ({ id: task.id, list_id: list.id, position: index }))
    );

    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/taskboard/tasks/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ workspaceId: activeWorkspaceId, tasks: updates }),
    });
  }

  async function handleAddList() {
    const title = newListTitle.trim();
    if (!title) return;
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/taskboard/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ title, workspaceId: activeWorkspaceId }),
    });
    if (res.ok) {
      setNewListTitle("");
      const newList = await res.json();
      setLists(prev => [...prev, { ...newList, tasks: [] }]);
    } else console.error("Failed to add list:", await res.text());
  }

  async function handleAddTask(listId) {
    const title = newTaskTitles[listId]?.trim();
    if (!title) return;
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/taskboard/task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ title, listId, workspaceId: activeWorkspaceId }),
    });
    if (res.ok) setNewTaskTitles(prev => ({ ...prev, [listId]: "" }));
    else console.error("Failed to add task:", await res.text());
  }

  async function handleDeleteTask(taskId) {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/taskboard/task/${taskId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
  }

  async function handleDeleteList(listId) {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/taskboard/list/${listId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
  }

  if (!activeWorkspaceId) {
    return (
      <div style={{ display: "flex", gap: "1rem" }}>
        <TaskBoardSidebar
          activeWorkspaceId={activeWorkspaceId}
          setActiveWorkspaceId={setActiveWorkspaceId}
        />
        <div style={{ padding: "2rem", color: "#666" }}>
          Select a workspace to view its Task Board
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <TaskBoardSidebar
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={setActiveWorkspaceId}
      />

      <div style={{ flex: 1, padding: "1rem" }}>
        {/* Add List */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            type="text"
            value={newListTitle}
            onChange={e => setNewListTitle(e.target.value)}
            placeholder="New list title..."
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #444",
              background: "#2C2C44",
              color: "#fff",
              flex: 1,
              maxWidth: "220px",
            }}
          />
          <button
            onClick={handleAddList}
            style={{
              background: "#4F46E5",
              color: "#fff",
              padding: "8px 12px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ➕ Add List
          </button>
        </div>

        {/* Kanban Grid (4 lists per row) */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px"
          }}>
            {lists.map(list => (
              <Droppable droppableId={list.id} key={list.id}>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      background: "#1F1F2F",
                      padding: "12px",
                      borderRadius: "12px",
                      minHeight: "150px",
                      maxHeight: "85vh",
                      overflowY: "auto",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    {/* List Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#fff" }}>{list.title}</h3>
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "18px" }}
                        title="Delete List"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Tasks */}
                    {list.tasks.map((task, index) => (
                      <Draggable draggableId={task.id} index={index} key={task.id}>
                        {provided => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              padding: "10px",
                              background: "#2C2C44",
                              borderRadius: "8px",
                              marginBottom: "8px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              cursor: "grab",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                              transition: "all 0.2s",
                              ...provided.draggableProps.style,
                            }}
                          >
                            <span style={{ color: "#fff" }}>{task.title}</span>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
                              title="Delete Task"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Add Task */}
                    <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                      <input
                        type="text"
                        value={newTaskTitles[list.id] || ""}
                        onChange={e => setNewTaskTitles(prev => ({ ...prev, [list.id]: e.target.value }))}
                        placeholder="New task..."
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: "6px",
                          border: "1px solid #444",
                          background: "#2C2C44",
                          color: "#fff",
                          fontSize: "0.9rem",
                        }}
                      />
                      <button
                        onClick={() => handleAddTask(list.id)}
                        style={{
                          background: "#4F46E5",
                          border: "none",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
