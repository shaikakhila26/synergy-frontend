import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { FiActivity, FiInfo, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const typeIcons = {
  info: FiInfo,
  success: FiCheckCircle,
  warning: FiAlertTriangle,
};

function getIcon(type) {
  const Icon = typeIcons[type] || FiActivity;
  return <Icon className="text-purple-600 w-5 h-5 mr-2 flex-shrink-0" />;
}

export default function ActivityFeed({ limit = 20 }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [items, setItems] = useState([]);

  // Fetch workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      const { data, error } = await supabase
        .from("workspaces")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching workspaces:", error);
        return;
      }
      setWorkspaces(data || []);
      if (data?.length > 0) setSelectedWorkspaceId(data[0].id);
    };

    fetchWorkspaces();
  }, []);

  // Load activity and subscribe to realtime
  useEffect(() => {
    if (!selectedWorkspaceId) return;
    let mounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, type, title, body, actor_id, created_at, data")
        .eq("workspace_id", selectedWorkspaceId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("ActivityFeed load error:", error);
        return;
      }
      if (mounted) setItems(data || []);
    };

    load();

    const channel = supabase
      .channel(`notifications-${selectedWorkspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `workspace_id=eq.${selectedWorkspaceId}`,
        },
        (payload) => {
          setItems((prev) => [payload.new, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [selectedWorkspaceId, limit]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-2xl font-bold text-purple-700 select-none">Recent Activity</h3>

        <div className="relative inline-block w-64">
          <select
            className="block w-full appearance-none bg-white border border-gray-300 text-purple-800 py-2 pl-3 pr-10 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-400 shadow-sm transition"
            value={selectedWorkspaceId}
            onChange={(e) => setSelectedWorkspaceId(e.target.value)}
            aria-label="Select Workspace"
          >
            <option value="">Select workspace...</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
         
        </div>
      </div>

      {!selectedWorkspaceId ? (
        <div className="text-center py-20 text-sm text-gray-500 select-none">
          Please select a workspace to view activity.
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-sm text-gray-500 select-none">No recent activity</div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.ul
            key={selectedWorkspaceId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {items.map((item) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="flex items-start bg-purple-50 border border-purple-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer select-text"
                title={`${item.title || item.type} - ${new Date(item.created_at).toLocaleString()}`}
              >
                {getIcon(item.type)}

                <div className="flex flex-col">
                  <span className="font-semibold text-purple-700 text-md leading-tight mb-0.5 truncate">
                    {item.title || item.type}
                  </span>
                  <p className="text-sm text-purple-900 opacity-80 leading-relaxed break-words whitespace-pre-wrap">
                    {item.body || <span className="italic text-gray-400">No details provided</span>}
                  </p>
                  <small className="text-xs text-gray-400 mt-1 select-none">
                    {new Date(item.created_at).toLocaleString()}
                  </small>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </AnimatePresence>
      )}
    </div>
  );
}
