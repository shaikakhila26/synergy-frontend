// src/hooks/useChat.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../AuthProvider';

export default function useChat({ workspaceId = null, dmWith = null }) {
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setMessages([]);
    setLoading(true);

    const fetchMessages = async () => {
      try {
        // Use backend REST endpoint to load messages (safer than direct supabase for auth)
        const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        let url;
        if (workspaceId) {
          url = `${base}/api/chat/messages?workspaceId=${workspaceId}`;
        } else if (dmWith) {
          url = `${base}/api/chat/messages?dmWith=${dmWith}`;
        } else {
          setMessages([]);
          setLoading(false);
          return;
        }

        const headers = {};
        // if using JWT for DMs
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

        const res = await fetch(url, { headers });
        const json = await res.json();
        const arr = Array.isArray(json.data?.messages) ? json.data.messages : [];
        if (mounted) setMessages(arr);
      } catch (err) {
        console.error('fetchMessages error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMessages();

    // subscribe to socket events
    if (socket) {
      if (workspaceId) {
        socket.emit('joinWorkspace', workspaceId);
        const onNew = (msg) => setMessages((p) => [...p, msg]);
        socket.on('newWorkspaceMessage', onNew);
        return () => {
          socket.off('newWorkspaceMessage', onNew);
          socket.emit('leaveWorkspace', workspaceId);
        };
      } else if (dmWith && user) {
        const a = user.id;
        const b = dmWith;
        socket.emit('joinDM', { userA: a, userB: b });
        const onNew = (msg) => setMessages((p) => [...p, msg]);
        socket.on('newDirectMessage', onNew);
        return () => {
          socket.off('newDirectMessage', onNew);
        };
      }
    }
    return () => { mounted = false; };
  }, [workspaceId, dmWith, socket]);

  const sendWorkspaceMessage = async (text) => {
    if (!socket || !workspaceId || !user) return;
    socket.emit('sendWorkspaceMessage', {
      workspace_id: workspaceId,
      sender_id: user.id,
      text,
    });
  };

  const sendDirectMessage = async (recipientId, text) => {
    if (!socket || !user) return;
    socket.emit('sendDirectMessage', {
      sender_id: user.id,
      recipient_id: recipientId,
      text,
    });
  };

  return {
    messages,
    loading,
    sendWorkspaceMessage,
    sendDirectMessage,
    setMessages,
  };
}
