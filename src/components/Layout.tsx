import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';

import './Layout.css';

export const Layout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '70px',
    width: '100%'
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    padding: '2rem',
    overflowY: 'auto'
  };

  return (
    <div style={containerStyle}>
      <Sidebar isCollapsed={isCollapsed} />
      <div className="main-area">
        <header className="topbar">
          <div className="topbar__inner">
            <button className="topbar__collapse" onClick={() => setIsCollapsed((v) => !v)}>
              {isCollapsed ? <Menu size={18} /> : <X size={18} />}
            </button>
            <div>
              <div className="topbar__title">PiolAPIs Repository</div>
              <div className="topbar__desc">Documenta tus APIs en un solo lugar ;D</div>
            </div>
          </div>
        </header>
        <main style={mainStyle}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};