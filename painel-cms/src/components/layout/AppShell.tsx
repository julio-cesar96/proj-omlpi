import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell: React.FC = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh' }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--content-padding-y) var(--content-padding-x) 60px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
