import React from 'react';
import { Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { DocumentationSetting } from '../types';
import './DocumentationSettingListItem.css';

interface DocumentationSettingListItemProps {
  setting: DocumentationSetting;
  onDelete: (id: string | null) => void;
  onEdit: (setting: DocumentationSetting) => void;
  onActivate: (id: string | null, currentStatus: boolean | undefined) => void;
}

export const DocumentationSettingListItem: React.FC<DocumentationSettingListItemProps> = ({
  setting,
  onDelete,
  onEdit,
  onActivate,
}) => {
  return (
    <div
      className={`documentation-setting-list-item ${
        !setting.isActive ? 'documentation-setting-list-item--inactive' : ''
      }`}
    >
      <div className="documentation-setting-list-item__main">
        <h4 className="documentation-setting-list-item__title" style={{ opacity: setting.isActive ? 1 : 0.6 }}>
          {setting.name}
        </h4>
        <p className="documentation-setting-list-item__description" style={{ opacity: setting.isActive ? 1 : 0.6 }}>
          {setting.description}
        </p>
        <div className="documentation-setting-list-item__meta">
          <span className="documentation-setting-list-item__meta-item">
            <strong>API Type:</strong> {setting.apiType}
          </span>
          <span className="documentation-setting-list-item__meta-item">
            <strong>Endpoint:</strong> {setting.baseEndpoint}
          </span>
          <span className="documentation-setting-list-item__meta-item">
            <strong>Creado:</strong> {new Date(setting.createdDate).toLocaleDateString()}
          </span>
          {!setting.isActive && (
            <span className="documentation-setting-list-item__status">Inactivo</span>
          )}
        </div>
      </div>

      <div className="documentation-setting-list-item__actions">
        <button
          type="button"
          onClick={() =>
            setting.id && onActivate(setting.id, setting.isActive)
          }
          className={`documentation-setting-list-item__btn ${
            setting.isActive ? 'documentation-setting-list-item__btn--active' : 'documentation-setting-list-item__btn--inactive'
          }`}
          title={setting.isActive ? 'Desactivar' : 'Activar'}
        >
          {setting.isActive ? (
            <ToggleRight size={20} style={{ color: '#2e7d32' }} />
          ) : (
            <ToggleLeft size={20} style={{ color: '#3e533f' }} />
          )}
        </button>
        <button
          type="button"
          onClick={() => onEdit(setting)}
          className="documentation-setting-list-item__btn documentation-setting-list-item__btn--edit"
          title="Editar"
        >
          <Pencil size={18} />
        </button>
        <button
          type="button"
          onClick={() => setting.id && onDelete(setting.id)}
          className="documentation-setting-list-item__btn documentation-setting-list-item__btn--delete"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
