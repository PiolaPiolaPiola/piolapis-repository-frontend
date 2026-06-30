import React from 'react';
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Project } from '../types';
import './ProjectListItem.css';

interface ProjectListItemProps {
  project: Project;
  onDelete: (id: string | null) => void;
  onEdit: (project: Project) => void;
  onActivate: (id: string | null, currentStatus: boolean | undefined) => void;
}

export const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onDelete, onEdit, onActivate }) => {
  return (
    <div className={`project-list-item ${!project.isActive ? 'project-list-item--inactive' : ''}`}>
      <div className="project-list-item__main">
        <h4 className="project-list-item__title" style={{ opacity: project.isActive ? 1 : 0.6 }}>
          {project.name}
        </h4>
        <p className="project-list-item__description" style={{ opacity: project.isActive ? 1 : 0.6 }}>
          {project.description}
        </p>
        <div className="project-list-item__meta">
          {project.code && (
            <span className="project-list-item__meta-item">
              <strong>Código:</strong> {project.code}
            </span>
          )}
          <span className="project-list-item__meta-item">
            <strong>Creado:</strong> {new Date(project.createdDate).toLocaleDateString()}
          </span>
          {!project.isActive && (
            <span className="project-list-item__status">Inactivo</span>
          )}
        </div>
      </div>

      <div className="project-list-item__actions">
        <button
          type="button"
          onClick={() => project.id && onActivate(project.id, project.isActive)}
          className={`project-list-item__btn ${project.isActive ? 'project-list-item__btn--active' : 'project-list-item__btn--inactive'}`}
          title={project.isActive ? 'Desactivar' : 'Activar'}
        >
          {project.isActive ? (
            <ToggleRight size={20} style={{ color: '#2e7d32' }} />
          ) : (
            <ToggleLeft size={20} style={{ color: '#3e533f' }} />
          )}
        </button>
        <button
          type="button"
          onClick={() => onEdit(project)}
          className="project-list-item__btn project-list-item__btn--edit"
          title="Editar"
        >
          <Pencil size={18} />
        </button>
        <button
          type="button"
          onClick={() => project.id && onDelete(project.id)}
          className="project-list-item__btn project-list-item__btn--delete"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
