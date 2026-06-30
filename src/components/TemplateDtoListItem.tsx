import React from 'react';
import { Pencil, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import type { TemplateDto } from '../types';
import './TemplateDtoListItem.css';

interface TemplateDtoListItemProps {
  item: TemplateDto;
  onDelete: (id: string) => void;
  onEdit: (item: TemplateDto) => void;
  onActivate: (id: string | null, currentStatus: boolean | undefined) => void;
  onView: (item: TemplateDto) => void;
}

const requestTypeLabels: Record<string, string> = {
  '0': 'POST',
  '1': 'GET',
  '2': 'PUT',
  '3': 'PATCH',
  '4': 'DELETE',
  '5': 'OPTIONS'
};

const responseTypeLabels: Record<string, string> = {
  S: 'Schema',
  J: 'JSON'
};

const apiTypeLabels: Record<string, string> = {
  G: 'GraphQL',
  R: 'REST',
  S: 'SOAP'
};

export const TemplateDtoListItem: React.FC<TemplateDtoListItemProps> = ({ item, onDelete, onEdit, onActivate, onView }) => {
  return (
    <div className={`template-dto-list-item ${!item.isActive ? 'template-dto-list-item--inactive' : ''}`}>
      <div className="template-dto-list-item__main">
        <h4 className="template-dto-list-item__title" style={{ opacity: item.isActive ? 1 : 0.6 }}>
          {item.name}
        </h4>
        <p className="template-dto-list-item__description" style={{ opacity: item.isActive ? 1 : 0.6 }}>
          {item.description}
        </p>
        <div className="template-dto-list-item__meta">
          <span className="template-dto-list-item__meta-item">
            <strong>Tipo:</strong> {item.type ? apiTypeLabels[item.type] || item.type : 'Sin tipo'}
          </span>
          <span className="template-dto-list-item__meta-item">
            <strong>Request:</strong> {requestTypeLabels[item.requestType] || item.requestType}
          </span>
          <span className="template-dto-list-item__meta-item">
            <strong>Response:</strong> {responseTypeLabels[item.responseType] || item.responseType}
          </span>
          {item.isShared && (
            <span className="template-dto-list-item__meta-item">Compartida</span>
          )}
          <span className="template-dto-list-item__meta-item">
            <strong>Creado:</strong> {new Date(item.createdDate).toLocaleDateString()}
          </span>
          {!item.isActive && (
            <span className="template-dto-list-item__status">Inactivo</span>
          )}
        </div>
      </div>

      <div className="template-dto-list-item__actions">
        <button
          type="button"
          onClick={() => onView(item)}
          className="template-dto-list-item__btn template-dto-list-item__btn--view"
          title="Ver detalles"
        >
          <Eye size={18} />
        </button>
        <button
          type="button"
          onClick={() => item.id && onActivate(item.id, item.isActive)}
          className={`template-dto-list-item__btn ${item.isActive ? 'template-dto-list-item__btn--active' : 'template-dto-list-item__btn--inactive'}`}
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
          onClick={() => onEdit(item)}
          className="template-dto-list-item__btn template-dto-list-item__btn--edit"
          title="Editar"
        >
          <Pencil size={18} />
        </button>
        <button
          type="button"
          onClick={() => item.id && onDelete(item.id)}
          className="template-dto-list-item__btn template-dto-list-item__btn--delete"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
