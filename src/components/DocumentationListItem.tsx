import React from 'react';
import { Trash2, Pencil, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Documentation } from '../types';
import './DocumentationListItem.css';

interface DocumentationListItemProps {
  item: Documentation;
  onEdit: (item: Documentation) => void;
  onDelete: (id: string) => void;
  onView: (item: Documentation) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

export const DocumentationListItem: React.FC<DocumentationListItemProps> = ({
  item,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
}) => {
  return (
    <div
      className={`documentation-list-item ${
        !item.isActive ? 'documentation-list-item--inactive' : ''
      }`}
    >
      <div className="documentation-list-item__main">
        <h4 className="documentation-list-item__title" style={{ opacity: item.isActive ? 1 : 0.6 }}>
          {item.name}
        </h4>
        <p className="documentation-list-item__description" style={{ opacity: item.isActive ? 1 : 0.6 }}>
          {item.description}
        </p>
        <div className="documentation-list-item__meta">
          <span className="documentation-list-item__meta-item">
            <strong>Versión:</strong> {item.version}
          </span>
          {item.endpointEspecifico && (
            <span className="documentation-list-item__meta-item">
              <strong>Endpoint:</strong> {item.endpointEspecifico}
            </span>
          )}
          <span className="documentation-list-item__meta-item">
            <strong>Creado:</strong> {new Date(item.createdDate).toLocaleDateString()}
          </span>
          {!item.isActive && (
            <span className="documentation-list-item__status">Inactivo</span>
          )}
        </div>
      </div>

      <div className="documentation-list-item__actions">
        <button
          type="button"
          onClick={() => onView(item)}
          className="documentation-list-item__btn documentation-list-item__btn--view"
          title="Ver detalles"
        >
          <Eye size={18} />
        </button>
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="documentation-list-item__btn documentation-list-item__btn--edit"
          title="Editar"
        >
          <Pencil size={18} />
        </button>
        <button
          type="button"
          onClick={() => item.id && onToggleStatus(item.id, !item.isActive)}
          className={`documentation-list-item__btn ${item.isActive ? 'documentation-list-item__btn--active' : 'documentation-list-item__btn--inactive'}`}
          title={item.isActive ? 'Desactivar' : 'Activar'}
        >
          {item.isActive ? (
            <ToggleRight size={20} style={{ color: '#2e7d32' }} />
          ) : (
            <ToggleLeft size={20} style={{ color: '#3e533f' }} />
          )}
        </button>
        <button
          type="button"
          onClick={() => item.id && onDelete(item.id)}
          className="documentation-list-item__btn documentation-list-item__btn--delete"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
