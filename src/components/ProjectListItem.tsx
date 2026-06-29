import React from 'react';
import { Pencil, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Project } from '../types';
import './ProjectListItem.css';

interface ProjectListItemProps {
  project: Project;
  onDelete: (id: string | null) => void;
  onEdit: (project: Project) => void;
  onActivate: (id: string | null, currentStatus: boolean | undefined) => void;
}

export const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onDelete, onEdit, onActivate }) => {
  const createdDate = project.createdDate ? new Date(project.createdDate).toLocaleString() : 'N/A';

  return (
    <li className={`project-item ${!project.isActive ? 'project-item--inactive' : ''}`}>
      <div className="project-item__header">
        <div>
          <strong style={{ opacity: project.isActive ? 1 : 0.6 }}>{project.name}</strong>
          <div className="project-item__meta">{project.code}</div>
          <span className="project-item__status" style={{ backgroundColor: project.isActive ? '' : '#b0cab2', color: project.isActive ? '' : '#f8f6f6' }}>
            {!project.isActive && 'Inactivo'}
          </span>
        </div>

        <div className="project-item__actions">
          <button
            type="button"
            className={`project-item__button ${project.isActive ? 'project-item__button--toggle-active' : 'project-item__button--toggle-inactive'}`}
            onClick={() => project.id && onActivate(project.id, project.isActive)}
            title={project.isActive ? 'Desactivar proyecto' : 'Activar proyecto'}
          >
            {project.isActive ? (
              <ToggleRight size={24} style={{ color: '#2e7d32' }} className="icon-toggle" />
            ) : (
              <ToggleLeft size={24} style={{ color: '#3e533f' }} className="icon-toggle" />
            )}
          </button>

          <button
            type="button"
            className="project-item__button project-item__button--edit"
            onClick={() => onEdit(project)}
            title="Editar proyecto"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            className="project-item__button project-item__button--delete"
            onClick={() => project.id && onDelete(project.id)}
            title="Eliminar proyecto"
          >
            <Trash2 size={16} />
          </button>

          <div className="project-item__info-icon" title={`Creado el: ${createdDate}`}>
            <Eye size={18} className="icon-eye" />
          </div>
        </div>
      </div>

      <p className="project-item__description" style={{ opacity: project.isActive ? 1 : 0.6 }}>
        {project.description}
      </p>
    </li>
  );
};
