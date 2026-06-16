import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
    width: '100%'
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto'
  };

  return (
    <div style={containerStyle}>
      <Sidebar />
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
};