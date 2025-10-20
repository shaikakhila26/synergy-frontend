// src/components/PresenceList.jsx
import React from "react";
import { usePresence } from "../contexts/PresenceProvider";

export default function PresenceList() {
  const { onlineUsers, isOnline } = usePresence();

  return (
    <div className="p-3">
      <h4 className="font-semibold mb-2">People</h4>
      <ul className="space-y-2">
        {onlineUsers.map(u => (
          <li key={u.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={u.avatar_url || "/avatar-placeholder.png"} className="w-8 h-8 rounded-full" alt="" />
              <div>
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-gray-500">{u.status_message}</div>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${isOnline(u) ? 'bg-green-500' : 'bg-gray-300'}`} title={isOnline(u) ? 'Online' : 'Offline'} />
          </li>
        ))}
      </ul>
    </div>
  );
}
