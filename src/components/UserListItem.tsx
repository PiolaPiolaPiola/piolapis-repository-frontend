import React from 'react';
import { Pencil, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import type { User } from '../types';
import './UserListItem.css';

interface UserListItemProps {
  user: User;
  onDelete: (id: string) => void;
  onEdit: (user: User) => void;
  onActivate: (id: string | null, currentStatus: boolean | undefined) => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({ user, onDelete, onEdit, onActivate }) => {
  const createdDate = user.createdDate ? new Date(user.createdDate).toLocaleString() : 'N/A';

  return (
    <li className={`user-item ${!user.isActive ? 'user-item--inactive' : ''}`}>
      <div className="user-item__header">
        <div>
          <strong style={{ opacity: user.isActive ? 1 : 0.6 }}>
            {user.name} {user.lastName}
          </strong>
          <div className="user-item__role">- <em>{user.role}</em></div>
            <span className="user-item__status" style={{ backgroundColor: user.isActive ? '' : '#b0cab2', color: user.isActive ? '' : '#f8f6f6' }}>
              {!user.isActive && 'Inactivo'}
            </span>
        </div>

        <div className="user-item__actions">
          <button
            type="button"
            className={`user-item__button ${user.isActive ? 'user-item__button--toggle-active' : 'user-item__button--toggle-inactive'}`}
            onClick={() => user.id && onActivate(user.id, user.isActive)}
            title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
          >
            {user.isActive ? (
              <ToggleRight size={24} style={{ color: '#2e7d32' }} className="icon-toggle" />
            ) : (
              <ToggleLeft size={24} style={{ color: '#3e533f' }} className="icon-toggle" />
            )}
          </button>
          
          <button
            type="button"
            className="user-item__button user-item__button--edit"
            onClick={() => onEdit(user)}
            title="Editar usuario"
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            className="user-item__button user-item__button--delete"
            onClick={() => user.id && onDelete(user.id)}
            title="Eliminar usuario"
          >
            <Trash2 size={16} />
          </button>

          <div className="user-item__info-icon" title={`Creado el: ${createdDate}`}>
            <Eye size={18} className="icon-eye" />
          </div>
        </div>
      </div>

      <p className="user-item__description" style={{ opacity: user.isActive ? 1 : 0.6 }}>
        {user.description}
      </p>
    </li>
  );
};