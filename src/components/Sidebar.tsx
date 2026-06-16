import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  ShieldCheck, 
  FolderGit2, 
  Settings, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut, 
  LogIn 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { session, theme, toggleTheme, loginMock, logout } = useApp();

  const sidebarStyle: React.CSSProperties = {
    width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
    backgroundColor: 'var(--color-container)',
    borderRight: '1px solid var(--color-border)',
    height: '100vh',
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.2s ease',
    overflow: 'hidden'
  };

  const headerStyle: React.CSSProperties = {
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'space-between',
    borderBottom: '1px solid var(--color-border)'
  };

  const navListStyle: React.CSSProperties = {
    listStyle: 'none',
    padding: '1rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1
  };

  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    gap: '1rem',
    backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
    color: isActive ? '#000000' : 'var(--color-text-primary)',
    fontWeight: isActive ? 'bold' : 'normal',
    justifyContent: isCollapsed ? 'center' : 'flex-start'
  });

  const footerStyle: React.CSSProperties = {
    padding: '1rem',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  };

  return (
    <aside style={sidebarStyle}>
      <div style={headerStyle}>
        {!isCollapsed && <span style={{ fontWeight: 'bold' }}>DocuChirp</span>}
        <button onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={navListStyle}>
          <li>
            <NavLink to="/users" style={linkStyle}>
              <Users size={20} />
              {!isCollapsed && <span>Usuarios</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/roles" style={linkStyle}>
              <ShieldCheck size={20} />
              {!isCollapsed && <span>Roles</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" style={linkStyle}>
              <FolderGit2 size={20} />
              {!isCollapsed && <span>Proyectos</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/configuration" style={linkStyle}>
              <Settings size={20} />
              {!isCollapsed && <span>Configuración</span>}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div style={footerStyle}>
        <button 
          onClick={toggleTheme} 
          style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          {!isCollapsed && <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>}
        </button>

        {session ? (
          <button 
            onClick={logout} 
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-alert)', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Salir ({session.username})</span>}
          </button>
        ) : (
          <button 
            onClick={loginMock} 
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
          >
            <LogIn size={20} />
            {!isCollapsed && <span>Iniciar Sesión</span>}
          </button>
        )}
      </div>
    </aside>
  );
};