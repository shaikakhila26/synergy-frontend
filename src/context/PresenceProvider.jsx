import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useWorkspace } from "./WorkspaceContext.jsx";
import { useAuth } from "../AuthProvider.jsx";

const PresenceContext = createContext();

export const PresenceProvider = ({ children }) => {
  const { activeWorkspaceId } = useWorkspace();
  const workspaceContext = useWorkspace();
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);

  
  if (!workspaceContext) {
    console.warn("PresenceProvider must be used inside WorkspaceProvider");
    return null;
  }
  useEffect(() => {
    if (!activeWorkspaceId || !user) return;

    const channel = supabase.channel(`workspace-presence:${activeWorkspaceId}`, {
      config: {
        presence: { key: user.id },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // track the current user presence
          await channel.track({
            user_id: user.id,
            email: user.email,
            last_active: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeWorkspaceId, user]);

  return (
    <PresenceContext.Provider value={{ onlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => useContext(PresenceContext);
