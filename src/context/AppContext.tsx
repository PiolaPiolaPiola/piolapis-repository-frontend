import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserSession } from '../types';

interface AppContextType {
  session: UserSession | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  loginMock: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const loginMock = () => {
    setSession({
      id: '1',
      username: 'admin_initial',
      name: 'Usuario',
      lastName: 'Prueba',
      role: 'Admin'
    });
  };

  const logout = () => {
    setSession(null);
  };

  return (
    <AppContext.Provider value={{ session, theme, toggleTheme, loginMock, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};