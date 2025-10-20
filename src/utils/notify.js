// src/utils/notify.js
import { supabase } from "../supabaseClient";

export async function createNotification({ userId = null, workspaceId = null, actorId = null, type = "generic", title = "", body = "", data = {} }) {
  try {
    const { error } = await supabase.from("notifications").insert([{
      user_id: userId,
      workspace_id: workspaceId,
      actor_id: actorId,
      type,
      title,
      body,
      data
    }]);
    if (error) throw error;
  } catch (e) {
    console.error("createNotification error:", e);
  }
}
