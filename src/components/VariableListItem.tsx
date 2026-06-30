import React from 'react';
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Variable } from '../types';
import './VariableListItem.css';

interface VariableListItemProps {
  variable: Variable;
  onDelete: (id: string | null) => void;
  onEdit: (variable: Variable) => void;
  onActivate: (id: string | null, currentStatus: boolean | undefined) => void;
}

export const VariableListItem: React.FC<VariableListItemProps> = ({ variable, onDelete, onEdit, onActivate }) => {
  return (
    <div className={`variable-list-item ${!variable.isActive ? 'variable-list-item--inactive' : ''}`}>
      <div className="variable-list-item__main">
        <h4 className="variable-list-item__title" style={{ opacity: variable.isActive ? 1 : 0.6 }}>
          {variable.name}
        </h4>
        <p className="variable-list-item__description" style={{ opacity: variable.isActive ? 1 : 0.6 }}>
          {variable.description}
        </p>
        <div className="variable-list-item__meta">
          <span className="variable-list-item__meta-item">
            <strong>Tipo:</strong> {variable.dataType}
          </span>
          {variable.exampleValue && (
            <span className="variable-list-item__meta-item">
              <strong>Ejemplo:</strong> {variable.exampleValue}
            </span>
          )}
          <span className="variable-list-item__meta-item">
            <strong>Creado:</strong> {new Date(variable.createdDate).toLocaleDateString()}
          </span>
          {!variable.isActive && (
            <span className="variable-list-item__status">Inactivo</span>
          )}
        </div>
      </div>

      <div className="variable-list-item__actions">
        <button
          type="button"
          onClick={() => variable.id && onActivate(variable.id, variable.isActive)}
          className={`variable-list-item__btn ${variable.isActive ? 'variable-list-item__btn--active' : 'variable-list-item__btn--inactive'}`}
          title={variable.isActive ? 'Desactivar' : 'Activar'}
        >
          {variable.isActive ? (
            <ToggleRight size={20} style={{ color: '#2e7d32' }} />
          ) : (
            <ToggleLeft size={20} style={{ color: '#3e533f' }} />
          )}
        </button>
        <button
          type="button"
          onClick={() => onEdit(variable)}
          className="variable-list-item__btn variable-list-item__btn--edit"
          title="Editar"
        >
          <Pencil size={18} />
        </button>
        <button
          type="button"
          onClick={() => variable.id && onDelete(variable.id)}
          className="variable-list-item__btn variable-list-item__btn--delete"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
