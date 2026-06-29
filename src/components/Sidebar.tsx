import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import lightLogo from '../assets/Logo_claro_png.png';
import darkLogo from '../assets/Logo_oscuro.png';
import { 
  Users, 
  FolderGit2, 
  Settings, 
  Hash,
  FileText,
  MessageSquare,
  Layers,
  Sun, 
  Moon, 
  LogOut, 
  LogIn,
  PanelsLeftBottom 
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
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
    padding: '0.75rem 1rem',
    height: '70px',
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
      <div style={headerStyle} className="sidebar__header">
        <div className="sidebar__brand">
          <Link to="/" className="sidebar__logo-link">
            <div className="sidebar__logo">
              <img src={theme === 'light' ? lightLogo : darkLogo} alt="Logo PiolAPIs" />
            </div>
          </Link>
          {!isCollapsed && <div className="sidebar__brand-text">PiolAPIs Repository</div>}
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={navListStyle}>
          <li>
            <NavLink to="/" style={linkStyle}>
              <PanelsLeftBottom size={20} />
              {!isCollapsed && <span>Panel Principal</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/users" style={linkStyle}>
              <Users size={20} />
              {!isCollapsed && <span>Usuarios</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" style={linkStyle}>
              <FolderGit2 size={20} />
              {!isCollapsed && <span>Proyectos</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/variables" style={linkStyle}>
              <Hash size={20} />
              {!isCollapsed && <span>Variables</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/documentaciones" style={linkStyle}>
              <FileText size={20} />
              {!isCollapsed && <span>Documentaciones</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/mensajes-codigos" style={linkStyle}>
              <MessageSquare size={20} />
              {!isCollapsed && <span>Mensajes/Códigos</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/configuraciones-documentacion" style={linkStyle}>
              <Layers size={20} />
              {!isCollapsed && <span>Config. Documentación</span>}
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
        {!isCollapsed && (
          <>
            <button 
              onClick={toggleTheme} 
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
            </button>

            {session ? (
              <button 
                onClick={logout} 
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-alert)', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
              >
                <LogOut size={20} />
                <span>Salir ({session.username})</span>
              </button>
            ) : (
              <button 
                onClick={loginMock} 
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
              >
                <LogIn size={20} />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </>
        )}
      </div>
    </aside>
  );
};