import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { UsersPage } from './pages/UsersPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { VariablesPage } from './pages/VariablesPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { CodeMessagesPage } from './pages/CodeMessagesPage';
import { DocumentationSettingsPage } from './pages/DocumentationSettingsPage';
import { TemplateDtosPage } from './pages/TemplateDtosPage';
import { DashboardPage } from './pages/DashboardPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="variables" element={<VariablesPage />} />
            <Route path="template-dtos" element={<TemplateDtosPage />} />
            <Route path="documentaciones" element={<DocumentationPage />} />
            <Route path="mensajes-codigos" element={<CodeMessagesPage />} />
            <Route path="configuraciones-documentacion" element={<DocumentationSettingsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="configuration" element={<ConfigurationPage />} />
            <Route path="*" element={<Navigate to="/users" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};