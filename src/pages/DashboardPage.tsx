import React from 'react';
import { Link } from 'react-router-dom';
import { FolderGit2, FileText, MessageSquare, Layers, Users, Hash } from 'lucide-react';
import './Dashboard.css';

export const DashboardPage: React.FC = () => {
  const cards = [
    { title: 'Usuarios', desc: 'Personas que interactúan con el catálogo y sus permisos.', to: '/users' },
    { title: 'Proyectos', desc: 'Documenta más de un proyecto dentro de un mismo catálogo.', to: '/projects' },
    { title: 'Variables', desc: 'Variables estándar de propiedades para las APIs', to: '/variables' },
    { title: 'Plantillas DTOs', desc: 'Plantillas reutilizables de DTOs de request / response por recurso.', to: '/template-dtos' },
    { title: 'Mensajes / Códigos', desc: 'Estandariza mensajes para los códigos genéricos de tus procesos.', to: '/mensajes-codigos' },
    { title: 'Configuración Documentación', desc: 'Formato estándar (JSON, Schema), tipo de API (REST, etc.) y reglas.', to: '/configuraciones-documentacion' },
    { title: 'Documentaciones', desc: 'Documentación de las APIs con todos los componentes configurados', to: '/documentaciones' },
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
          if (c.title === 'Variables') Icon = Hash;
          if (c.title === 'Usuarios') Icon = Users;
          if (c.title === 'Documentaciones') Icon = FileText;

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
