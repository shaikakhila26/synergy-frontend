import React from 'react';
import WorkspaceSelector from '../WorkspaceSelector';
import ChatRoom from '../features/ChatRoom';

export default function ChatLayout() {
  return (
    <div style={{ display: 'flex', gap: '16px', height: '100vh' }}>
      <WorkspaceSelector />
      <ChatRoom />
    </div>
  );
}
