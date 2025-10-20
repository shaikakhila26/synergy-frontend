// src/components/WorkspaceSelector.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../AuthProvider';
import styled from 'styled-components';

const Sidebar = styled.div`
  width: 280px;
  padding:12px;
  background:#fff;
  border-radius:12px;
  display:flex;
  flex-direction:column;
  gap:8px;
`;

const Item = styled.div`
  padding:10px;
  border-radius:8px;
  cursor:pointer;
  background: ${p => p.$active ? '#eee' : 'transparent'};
  &:hover{ background:#f2f2f6 }
`;

export default function WorkspaceSelector() {
  const [workspaces, setWorkspaces] = useState([]);
  const { activeWorkspaceId, openWorkspace } = useWorkspace();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const load = async () => {
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
      <h3>Workspaces</h3>
      {workspaces.map(ws => (
        <Item
          key={ws.id}
          active={activeWorkspaceId === ws.id}
          onClick={() => openWorkspace(ws.id)}
          $active={activeWorkspaceId === ws.id}
        >
          {ws.name}
        </Item>
      ))}
    </Sidebar>
  );
}
