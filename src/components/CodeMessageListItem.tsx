import React from 'react';
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { CodeMessage } from '../types';
import './CodeMessageListItem.css';

interface CodeMessageListItemProps {
  item: CodeMessage;
  onDelete: (id: string | null) => void;
  onEdit: (item: CodeMessage) => void;
  onActivate: (id: string | null, currentStatus: boolean | undefined) => void;
}

export const CodeMessageListItem: React.FC<CodeMessageListItemProps> = ({ item, onDelete, onEdit, onActivate }) => {
  return (
    <div className={`code-message-list-item ${!item.isActive ? 'code-message-list-item--inactive' : ''}`}>
      <div className="code-message-list-item__main">
        <h4 className="code-message-list-item__title" style={{ opacity: item.isActive ? 1 : 0.6 }}>
          {item.name}
        </h4>
        <p className="code-message-list-item__description" style={{ opacity: item.isActive ? 1 : 0.6 }}>
          {item.description}
        </p>
        <div className="code-message-list-item__meta">
          <span className="code-message-list-item__meta-item">
            <strong>Código:</strong> {item.code}
          </span>
          <span className="code-message-list-item__meta-item">
            <strong>HTTP:</strong> {item.httpCode}
          </span>
          <span className="code-message-list-item__meta-item">
            <strong>Respuesta:</strong> {item.response}
          </span>
          <span className="code-message-list-item__meta-item">
            <strong>Creado:</strong> {new Date(item.createdDate).toLocaleDateString()}
          </span>
          {!item.isActive && (
            <span className="code-message-list-item__status">Inactivo</span>
          )}
        </div>
      </div>

      <div className="code-message-list-item__actions">
        <button
          type="button"
          onClick={() => item.id && onActivate(item.id, item.isActive)}
          className={`code-message-list-item__btn ${item.isActive ? 'code-message-list-item__btn--active' : 'code-message-list-item__btn--inactive'}`}
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
          className="code-message-list-item__btn code-message-list-item__btn--edit"
          title="Editar"
        >
          <Pencil size={18} />
        </button>
        <button
          type="button"
          onClick={() => item.id && onDelete(item.id)}
          className="code-message-list-item__btn code-message-list-item__btn--delete"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
