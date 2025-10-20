import React, { useState } from "react";
import { Bell, CheckCheck } from "lucide-react"; // using lucide icons (already available)
import { useNotifications } from "../context/NotificationsProvider.jsx";
import { supabase } from "../supabaseClient";



export default function NotificationBell() {
  const { notifications,setNotifications } = useNotifications();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.length;

  console.log("[NotificationBell] Notifications:", notifications);

// ✅ Mark a single notification as read
  const handleMarkAsRead = async (id) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    if (error) {
      console.error("Failed to mark notification as read:", error);
      return;
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ✅ Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    const ids = notifications.map((n) => n.id);
    if (ids.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .in("id", ids);

    if (error) {
      console.error("Failed to mark all notifications as read:", error);
      return;
    }

    setNotifications([]); // clear locally
  };

  return (
    <div style={{ position: "relative", marginRight: "1rem" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <Bell size={24} color="#420D4B" />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "#e11d48",
              color: "white",
              borderRadius: "9999px",
              fontSize: "10px",
              padding: "2px 5px",
              minWidth: "16px",
              textAlign: "center",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "130%",
            background: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            borderRadius: "8px",
            width: "280px",
            maxHeight: "300px",
            overflowY: "auto",
            zIndex: 1000,
          }}
        >
         {/* Mark All as Read */}
          {notifications.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.6rem 1rem",
                borderBottom: "1px solid #eee",
                background: "#f9fafb",
              }}
            >
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                Notifications
              </span>
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "transparent",
                  border: "none",
                  color: "#420D4B",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                }}
              >
                <CheckCheck size={16} /> Mark all
              </button>
            </div>
          )}

          {/* List */}
          {notifications.length === 0 ? (
            <div
              style={{
                padding: "1rem",
                textAlign: "center",
                fontSize: "0.9rem",
                color: "#666",
              }}
            >
              No notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "0.7rem 1rem",
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  background: "#fff",
                  transition: "background 0.2s",
                }}
               
                
              >
                <div
                  style={{ flex: 1, marginRight: "0.5rem", cursor: "pointer" }}
                  onClick={() => {
                    // ✅ You can later use this for navigation or opening the related item
                    console.log("Clicked notification:", n);
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      color: "#333",
                    }}
                  >
                    {n.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#666",
                      marginTop: "2px",
                    }}
                  >
                    {n.body}
                  </div>
                </div>

                {/* Mark as Read Button */}
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#420D4B",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                  title="Mark as read"
                >
                  <CheckCheck size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 

        
