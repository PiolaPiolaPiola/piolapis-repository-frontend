import React from 'react';
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { User } from '../types';
import './UserListItem.css';

interface UserListItemProps {
  user: User;
  onDelete: (id: string) => void;
  onEdit: (user: User) => void;
  onActivate: (id: string | null, currentStatus: boolean | undefined) => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({ user, onDelete, onEdit, onActivate }) => {
  return (
    <div className={`user-list-item ${!user.isActive ? 'user-list-item--inactive' : ''}`}>
      <div className="user-list-item__main">
        <h4 className="user-list-item__title" style={{ opacity: user.isActive ? 1 : 0.6 }}>
          {user.name} {user.lastName}
        </h4>
        <p className="user-list-item__description" style={{ opacity: user.isActive ? 1 : 0.6 }}>
          {user.description}
        </p>
        <div className="user-list-item__meta">
          <span className="user-list-item__meta-item">
            <strong>Rol:</strong> {user.role}
          </span>
          <span className="user-list-item__meta-item">
            <strong>Creado:</strong> {new Date(user.createdDate).toLocaleDateString()}
          </span>
          {!user.isActive && (
            <span className="user-list-item__status">Inactivo</span>
          )}
        </div>
      </div>

      <div className="user-list-item__actions">
        <button
          type="button"
          onClick={() => user.id && onActivate(user.id, user.isActive)}
          className={`user-list-item__btn ${user.isActive ? 'user-list-item__btn--active' : 'user-list-item__btn--inactive'}`}
          title={user.isActive ? 'Desactivar' : 'Activar'}
        >
          {user.isActive ? (
            <ToggleRight size={20} style={{ color: '#2e7d32' }} />
          ) : (
            <ToggleLeft size={20} style={{ color: '#3e533f' }} />
          )}
        </button>
        <button
          type="button"
          onClick={() => onEdit(user)}
          className="user-list-item__btn user-list-item__btn--edit"
          title="Editar"
        >
          <Pencil size={18} />
        </button>
        <button
          type="button"
          onClick={() => user.id && onDelete(user.id)}
          className="user-list-item__btn user-list-item__btn--delete"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};