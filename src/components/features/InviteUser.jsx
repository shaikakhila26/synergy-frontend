// src/components/InviteUser.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function InviteUser({ workspaceId }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

const sendInvite = async () => {
  if (!email || !workspaceId) return;
  setSending(true);
  try {
    const { data: { session } } = await supabase.auth.getSession();

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const res = await fetch(`${backendUrl}/api/workspace/${workspaceId}/invite`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email }),
    });
    const out = await res.json();
    if (res.ok) {
      toast.success('Invite sent successfully to ' + email);

      setEmail('');
    } else {
      toast.error(out.message || 'Failed to send invite');

    }
  } catch (err) {
    console.error(err);
    toast.error('Network error');

  } finally {
    setSending(false);
  }
};


  return (
    <div className="p-3">
      <ToastContainer />
      <div className="mb-2">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email to invite" className="p-2 border rounded w-full" />
      </div>
      <button onClick={sendInvite} disabled={sending || !email} className="px-3 py-1 bg-indigo-600 text-white rounded">
        {sending ? "Sending…" : "Send Invite"}
      </button>
    </div>
  );
}
