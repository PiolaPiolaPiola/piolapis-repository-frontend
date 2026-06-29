import React from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, FileText, MessageSquare, Layers, Users } from 'lucide-react';
import './Dashboard.css';

export const DashboardPage: React.FC = () => {
  const cards = [
    { title: 'Proyectos', desc: 'Documenta más de un proyecto dentro de un mismo catálogo.', to: '/projects' },
    { title: 'Plantillas DTOs', desc: 'Plantillas reutilizables de DTOs de request / response por recurso.', to: '/documentaciones' },
    { title: 'Mensajes / Códigos', desc: 'Estandariza mensajes para los códigos genéricos de tus procesos.', to: '/mensajes-codigos' },
    { title: 'Configuración Documentación', desc: 'Formato estándar (JSON, Schema), tipo de API (REST, etc.) y reglas.', to: '/configuraciones-documentacion' },
    { title: 'Usuarios', desc: 'Personas que interactúan con el catálogo y sus permisos.', to: '/users' }
  ];

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Catálogo de APIs</h1>
      <p className="dashboard__subtitle">Bienvenido. Selecciona un módulo para comenzar a documentar.</p>

      <div className="dashboard__grid">
        {cards.map((c) => {
          let Icon = FileText;
          if (c.title === 'Proyectos') Icon = FolderGit2;
          if (c.title === 'Plantillas DTOs') Icon = FileText;
          if (c.title === 'Mensajes / Códigos') Icon = MessageSquare;
          if (c.title === 'Configuración Documentación') Icon = Layers;
          if (c.title === 'Usuarios') Icon = Users;

          return (
            <Link key={c.title} to={c.to} className="dashboard__card">
              <div className="dashboard__card-icon"><Icon size={20} /></div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
              <span className="dashboard__card-link">Abrir módulo →</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
