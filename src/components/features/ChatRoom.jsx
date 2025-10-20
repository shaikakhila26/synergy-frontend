// src/components/Chat/ChatRoom.jsx
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import useChat from '../../hooks/useChat';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../AuthProvider';

const COLORS = { pink: "#F5D5E0", blue: "#6667AB", purple: "#7B337E", dark: "#420D4B", deepest: "#210635" };

const Layout = styled.div`
  display:flex;
  height: calc(100vh - 64px);
  gap: 16px;
`;

// left column (chat list) will be provided separately; this component focuses on main chat area
const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(33,6,53,0.06);
`;

const Header = styled.div`
  padding: 12px 16px;
  background: linear-gradient(90deg, ${COLORS.purple}, ${COLORS.blue});
  color: ${COLORS.pink};
  display:flex;
  align-items:center;
  justify-content:space-between;
`;

const Messages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(180deg, #fff, ${COLORS.pink}11 80%);
`;

const MessageRow = styled.div`
  display:flex;
  justify-content: ${props => (props.isown ? 'flex-end' : 'flex-start')};
  margin-bottom: 10px;
`;

const Bubble = styled.div`
  background: ${props => (props.isown ? COLORS.purple : COLORS.pink)};
  color: ${props => (props.isown ? 'white' : COLORS.dark)};
  padding: 10px 14px;
  border-radius: 12px;
  max-width: 70%;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
`;

const InputBar = styled.form`
  padding: 12px;
  background: ${COLORS.pink};
  border-top: 1px solid ${COLORS.blue};
  display:flex;
  gap:8px;
`;

const Input = styled.input`
  flex:1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  outline: none;
`;

const Send = styled.button`
  background: ${COLORS.purple};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
`;

export default function ChatRoom() {
  const { activeWorkspaceId, activeDMUserId , onlineUsers= []} = useWorkspace();
  const { user } = useAuth();
  const { messages, loading, sendWorkspaceMessage, sendDirectMessage } = useChat({
    workspaceId: activeWorkspaceId,
    dmWith: activeDMUserId,
  });

  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (activeWorkspaceId) sendWorkspaceMessage(text);
    else if (activeDMUserId) sendDirectMessage(activeDMUserId, text);
    setText('');
  };

// Fallback initials avatar as SVG
function defaultAvatar(nameOrEmail) {
  if (!nameOrEmail) return "";
  const initials = nameOrEmail
    .split(" ")
    .map(part => part[0].toUpperCase())
    .slice(0, 2)
    .join("");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
      <rect width="100%" height="100%" fill="#6667AB"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-size="32" fill="white" font-family="Arial, sans-serif">${initials}</text>
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

  function PresenceBar({onlineUsers }) {
     if (!onlineUsers || onlineUsers.length === 0) return null;
  //const { onlineUsers } = useWorkspace();
  return (
    <div style={{ display: 'flex', gap: 10, padding: 8, background: '#f5f5f5' }}>
      {onlineUsers.map(u => (
        <div key={u.id} style={{ textAlign: 'center' }}>
          <img 
            src={u.avatar_url || defaultAvatar(u.name)} 
            alt={u.name} 
            style={{ width: 30, height: 30, borderRadius: '50%' }} 
          />
          <div style={{ fontSize: 10 }}>{u.name}</div>
        </div>
      ))}
    </div>
  );
}

  return (
    <Layout>
      <ChatArea>
        <Header>
          <div>
            <strong>{ activeWorkspaceId ? `Workspace Chat` : `Direct Message` }</strong>
           
          </div>
          
        </Header>


<PresenceBar onlineUsers = {onlineUsers} />   {/* 👈 Online users displayed here */}
        <Messages>
          {loading && <div style={{color:COLORS.purple}}>Loading messages...</div>}
          {(!loading && messages.length === 0) && (
            <div style={{ textAlign:'center', marginTop:50, color:COLORS.deepest }}>
              
              <h3>You're starting a new conversation</h3>
              <p>Type your first message below.</p>
            </div>
          )}

          {messages.map(m => (
            <MessageRow key={m.id} isown={m.sender_id === user?.id}>
              <Bubble isown={m.sender_id === user?.id}>
                <div style={{fontSize:12, opacity:0.85, marginBottom:6}}>
                  {m.sender_id === user?.id ? 'You' : m.sender_id}
                </div>
                <div>{m.text}</div>
                <div style={{fontSize:11, opacity:0.6, marginTop:6}}>
                  {new Date(m.created_at).toLocaleTimeString()}
                </div>
              </Bubble>
            </MessageRow>
          ))}

          <div ref={bottomRef} />
        </Messages>

        <InputBar onSubmit={handleSend}>
          <Input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message..." />
          <Send type="submit">Send</Send>
        </InputBar>
      </ChatArea>
    </Layout>
  );
}
