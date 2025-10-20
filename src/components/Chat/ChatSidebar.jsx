// src/components/Chat/ChatSidebar.jsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../../supabaseClient';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../AuthProvider';

const Sidebar = styled.div`
  width: 320px;
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 30px rgba(33,6,53,0.06);
  display:flex;
  flex-direction:column;
  gap:8px;
`;

const Item = styled.div`
  padding:10px;
  border-radius:8px;
  cursor:pointer;
  &:hover{ background:#f2f2f6 }
  background: ${p => p.$active ? '#eee' : 'transparent'};
`;

export default function ChatSidebar() {
  const [workspaces, setWorkspaces] = useState([]);
  const { openWorkspace, openDM, activeWorkspaceId, activeDMUserId } = useWorkspace();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('workspace_members')
        .select('workspaces(id,name)')
        .eq('user_id', user.id);
      if (!error && data) setWorkspaces(data.map(r => r.workspaces).filter(Boolean));
    };
    load();
  }, [user]);

  return (
    <Sidebar>
      <h3>Chats</h3>
      <div>
        <strong>Workspaces</strong>
        {workspaces.map(ws => (
          <Item key={ws.id} onClick={() => openWorkspace(ws.id)} $active={activeWorkspaceId === ws.id}>
            {ws.name}
          </Item>
        ))}
      </div>

      <div style={{marginTop:8}}>
        <strong>Direct Messages</strong>
        {/* simple discovery: search by email or show recent DM users */}
        <Item onClick={() => openDM('some-user-id')}>Start DM (enter email flow)</Item>
      </div>
    </Sidebar>
  );
}
