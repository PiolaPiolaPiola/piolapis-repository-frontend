import React from 'react';
import { Pencil, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Variable } from '../types';
import './VariableListItem.css';

interface VariableListItemProps {
  variable: Variable;
  onDelete: (id: string | null) => void;
  onEdit: (variable: Variable) => void;
  onActivate: (id: string | null, currentStatus: boolean | undefined) => void;
}

export const VariableListItem: React.FC<VariableListItemProps> = ({ variable, onDelete, onEdit, onActivate }) => {
  const createdDate = variable.createdDate ? new Date(variable.createdDate).toLocaleString() : 'N/A';

  return (
    <li className={`variable-item ${!variable.isActive ? 'variable-item--inactive' : ''}`}>
      <div className="variable-item__header">
        <div>
          <strong style={{ opacity: variable.isActive ? 1 : 0.6 }}>
            {variable.name} - {variable.dataType}
          </strong>
          <span className="variable-item__status" style={{ backgroundColor: variable.isActive ? '' : '#b0cab2', color: variable.isActive ? '' : '#f8f6f6' }}>
            {!variable.isActive && 'Inactivo'}
          </span>
        </div>

        <div className="variable-item__actions">
          <button
            type="button"
            className={`variable-item__button ${variable.isActive ? 'variable-item__button--toggle-active' : 'variable-item__button--toggle-inactive'}`}
            onClick={() => variable.id && onActivate(variable.id, variable.isActive)}
            title={variable.isActive ? 'Desactivar variable' : 'Activar variable'}
          >
            {variable.isActive ? (
              <ToggleRight size={24} style={{ color: '#2e7d32' }} className="icon-toggle" />
            ) : (
              <ToggleLeft size={24} style={{ color: '#3e533f' }} className="icon-toggle" />
            )}
          </button>

          <button
            type="button"
            className="variable-item__button variable-item__button--edit"
            onClick={() => onEdit(variable)}
            title="Editar variable"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            className="variable-item__button variable-item__button--delete"
            onClick={() => variable.id && onDelete(variable.id)}
            title="Eliminar variable"
          >
            <Trash2 size={16} />
          </button>

          <div className="variable-item__info-icon" title={`Creado el: ${createdDate}`}>
            <Eye size={18} className="icon-eye" />
          </div>
        </div>
      </div>

      <p className="variable-item__description" style={{ opacity: variable.isActive ? 1 : 0.6 }}>
        {variable.description}
      </p>

      {variable.exampleValue && (
        <div className="variable-item__example">
          <span>Ejemplo:</span> {variable.exampleValue}
        </div>
      )}
    </li>
  );
};
