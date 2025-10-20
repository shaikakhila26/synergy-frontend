// src/context/NotificationsContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useWorkspace } from "./WorkspaceContext";
import { useAuth } from "../AuthProvider";

const NotificationsContext = createContext();

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { activeWorkspaceId } = useWorkspace();
  
const { user } = useAuth();

 // const workspaceContext = useWorkspace();

 /* if (!workspaceContext) {
    // Context not ready yet, return children without notifications
    return children;
  }
*/
  //const { activeWorkspaceId } = workspaceContext;


  // Ask for permission once
  /*
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  */

  useEffect(() => {
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}, []);


  // ✅ Load unread notifications initially
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[NotificationsProvider] Fetch error:", error);
        return;
      }

      setNotifications(data || []);
    };

    fetchNotifications();
  }, [user?.id]);
 

useEffect(() => {
  if (!user?.id) return;

  const channel = supabase
    .channel(`notifications:user:${user.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      },
      payload => {
        setNotifications(prev => [payload.new, ...prev]);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [user?.id]);


console.log("[NotificationsProvider] activeWorkspaceId =", activeWorkspaceId);


  return (
    <NotificationsContext.Provider value={{ notifications , setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
