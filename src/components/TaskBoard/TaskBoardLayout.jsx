import React from 'react';
import WorkspaceSelector from '../WorkspaceSelector';
import TaskBoard from '../features/TaskBoard';

export default function TaskBoardLayout() {
  return (
    <div style={{ display: 'flex', gap: '16px', height: '100vh' }}>
      <WorkspaceSelector />
      <TaskBoard />
    </div>
  );
}
