// src/context/WorkspaceContext.jsx
import React, { createContext, useContext, useState ,useEffect } from 'react';
import {supabase} from '../supabaseClient';
import { useAuth } from '../AuthProvider';
import { useSocket } from './SocketContext.jsx';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const socket = useSocket();
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [activeDMUserId, setActiveDMUserId] = useState(); // for 1:1 chats
  const [workspaces, setWorkspaces] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const openWorkspace = (id) => {
    setActiveDMUserId(null);
    setActiveWorkspaceId(id);
  };
  const openDM = (userId) => {
    setActiveWorkspaceId(null);
    setActiveDMUserId(userId);
  };

  // ✅ Fetch workspaces user is a member of
  useEffect(() => {
    if (!user) return;

    async function fetchWorkspaces() {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("workspace:workspace_id ( id, name )")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching workspaces:", error);
        return;
      }

      // Flatten the array so it's just [{id, name}, ...]
      const formatted = data.map(d => d.workspace);
      setWorkspaces(formatted);
    }

    fetchWorkspaces();
  }, [user]);

   // Socket presence updates
  useEffect(() => {
    if (!socket || !user) return;
    if (!activeWorkspaceId) {
      setOnlineUsers([]);
      return;
    }

    socket.emit("joinPresenceRoom", activeWorkspaceId,{
       id: user.id,
  name: user.name || user.email,
  avatar_url: user.avatar_url || null,
    });

    const handlePresenceUpdate = (users) => {
     const others = users.filter(u => u.id !== user.id);
    setOnlineUsers(others);
    };

    socket.on("presenceUpdate", handlePresenceUpdate);

    return () => {
      socket.emit("leavePresenceRoom", activeWorkspaceId);
      socket.off("presenceUpdate", handlePresenceUpdate);
      setOnlineUsers([]);
    };
  }, [socket, activeWorkspaceId]);

  return (
    <WorkspaceContext.Provider value={{
      activeWorkspaceId, setActiveWorkspaceId,
      workspaces,setWorkspaces,
      activeDMUserId, setActiveDMUserId,
      openWorkspace, openDM , onlineUsers
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
