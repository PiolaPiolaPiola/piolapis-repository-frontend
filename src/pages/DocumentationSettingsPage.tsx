import React, { useEffect, useState } from 'react';
import type { DocumentationSetting, Project } from '../types';
import { documentationSettingService } from '../services/documentationSettingService';
import { projectService } from '../services/projectService';
import { DocumentationSettingListItem } from '../components/DocumentationSettingListItem';
import { documentationSettingSchema } from '../schemas/documentationSettingSchema';
import './DocumentationSettingsPage.css';

export const DocumentationSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<DocumentationSetting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseEndpoint: '',
    apiType: 'R',
    proyectoId: '',
  });

  useEffect(() => {
    fetchSettings();
    fetchProjects();
  }, [includeInactive]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentationSettingService.getAll(includeInactive);
      setSettings(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar configuraciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectService.getAll(true);
      setProjects(data);
    } catch (err: any) {
      console.error('Error al cargar proyectos:', err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };
      const fieldSchema = documentationSettingSchema.shape[name as keyof typeof documentationSettingSchema.shape];

      if (fieldSchema) {
        const result = fieldSchema.safeParse(value);
        if (!result.success) {
          const issue = result.error.issues[0];
          setFieldErrors((prevErrors) => ({
            ...prevErrors,
            [name]: issue?.message || 'Campo inválido',
          }));
        } else {
          setFieldErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors };
            delete updatedErrors[name];
            return updatedErrors;
          });
        }
      }

      return updatedForm;
    });
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', baseEndpoint: '', apiType: 'R', proyectoId: '' });
    setEditingId(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = documentationSettingSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    try {
      if (editingId) {
        if (!window.confirm('¿Deseas actualizar esta configuración?')) return;
        
        await documentationSettingService.update(editingId, {
          name: result.data.name,
          description: result.data.description,
          baseEndpoint: result.data.baseEndpoint,
          apiType: result.data.apiType,
        });

        setSettings((prev) =>
          prev.map((setting) =>
            setting.id === editingId
              ? {
                  ...setting,
                  name: result.data.name,
                  description: result.data.description,
                  baseEndpoint: result.data.baseEndpoint,
                  apiType: result.data.apiType,
                }
              : setting
          )
        );
        alert('Configuración actualizada exitosamente');
        resetForm();
        return;
      }

      if (!window.confirm('¿Deseas crear esta configuración?')) return;
      
      const created = await documentationSettingService.create({
        name: result.data.name,
        description: result.data.description,
        baseEndpoint: result.data.baseEndpoint,
        apiType: result.data.apiType,
        proyectoId: result.data.proyectoId,
      });
      setSettings((prev) => [...prev, created]);
      alert('Configuración creada exitosamente');
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al guardar configuración');
    }
  };

  const handleDelete = async (id: string | null) => {
    if (!id) return;
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta configuración?')) return;
    try {
      await documentationSettingService.delete(id);
      setSettings((prev) => prev.filter((p) => p.id !== id));
      alert('Configuración eliminada exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar configuración');
    }
  };

  const handleEdit = (setting: DocumentationSetting) => {
    if (!setting.id) return;
    setFormData({
      name: setting.name,
      description: setting.description,
      baseEndpoint: setting.baseEndpoint,
      apiType: setting.apiType,
      proyectoId: setting.proyectoId,
    });
    setEditingId(setting.id);
    setFieldErrors({});
  };

  const handleActivate = async (
    id: string | null,
    currentStatus: boolean | undefined
  ) => {
    if (!id) return;
    try {
      const newStatus = !currentStatus;
      await documentationSettingService.changeStatus(id, newStatus);
      setSettings((prev) => {
        if (!newStatus && !includeInactive) {
          return prev.filter((setting) => setting.id !== id);
        }
        return prev.map((setting) =>
          setting.id === id ? { ...setting, isActive: newStatus } : setting
        );
      });
    } catch (err: any) {
      setError(err.message || 'No se pudo cambiar el estado de la configuración.');
    }
  };

  return (
    <div>
      <h2 className="users-page__title">Configuraciones de Documentación</h2>
      {error && (
        <div className="users-page__error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="users-page__form" noValidate>
        <div className="users-page__field-group">
          <label className="users-page__label">
            Nombre <span className="users-page__required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`users-page__input ${fieldErrors.name ? 'users-page__input--error' : ''}`}
            placeholder="Ej. Configuración API Principal"
          />
          {fieldErrors.name && (
            <span className="users-page__feedback-error">{fieldErrors.name}</span>
          )}
        </div>

        <div className="users-page__field-group">
          <label className="users-page__label">
            Endpoint Base <span className="users-page__required">*</span>
          </label>
          <input
            type="text"
            name="baseEndpoint"
            value={formData.baseEndpoint}
            onChange={handleChange}
            className={`users-page__input ${fieldErrors.baseEndpoint ? 'users-page__input--error' : ''}`}
            placeholder="https://api.example.com"
          />
          {fieldErrors.baseEndpoint && (
            <span className="users-page__feedback-error">{fieldErrors.baseEndpoint}</span>
          )}
        </div>

        <div className="users-page__field-group">
          <label className="users-page__label">
            Tipo de API <span className="users-page__required">*</span>
          </label>
          <select
            name="apiType"
            value={formData.apiType}
            onChange={handleChange}
            className={`users-page__select ${fieldErrors.apiType ? 'users-page__input--error' : ''}`}
          >
            <option value="">Selecciona un tipo</option>
            <option value="R">REST</option>
            <option value="G">GraphQL</option>
            <option value="S">SOAP</option>
          </select>
          {fieldErrors.apiType && (
            <span className="users-page__feedback-error">{fieldErrors.apiType}</span>
          )}
        </div>

        <div className="users-page__field-group">
          <label className="users-page__label">
            Proyecto <span className="users-page__required">*</span>
          </label>
          <select
            name="proyectoId"
            value={formData.proyectoId}
            onChange={handleChange}
            className={`users-page__select ${fieldErrors.proyectoId ? 'users-page__input--error' : ''}`}
            disabled={editingId !== null}
          >
            <option value="">Selecciona un proyecto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id || ''}>
                {project.name}
              </option>
            ))}
          </select>
          {fieldErrors.proyectoId && (
            <span className="users-page__feedback-error">{fieldErrors.proyectoId}</span>
          )}
        </div>

        <div className="users-page__field-group">
          <label className="users-page__label">
            Descripción <span className="users-page__required">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`users-page__input ${fieldErrors.description ? 'users-page__input--error' : ''}`}
            placeholder="Describe el propósito de esta configuración"
            rows={4}
          />
          {fieldErrors.description && (
            <span className="users-page__feedback-error">{fieldErrors.description}</span>
          )}
        </div>

        <div className="users-page__actions">
          <button type="submit" className="users-page__button">
            {editingId ? 'Editar' : 'Registrar'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="users-page__button users-page__button--cancel"
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div className="users-page__list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px 0' }}>
        <h3 className="users-page__subtitle" style={{ margin: 0 }}>
          Configuraciones existentes
        </h3>

        <label className="users-page__checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="users-page__checkbox"
          />
          <span>Incluir inactivos</span>
        </label>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : settings.length === 0 ? (
        <p>No se encontraron configuraciones.</p>
      ) : (
        <div className="documentation-settings-page__list">
          {settings.map((setting) => (
            <DocumentationSettingListItem
              key={setting.id}
              setting={setting}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onActivate={handleActivate}
            />
          ))}
        </div>
      )}
    </div>
  );
};
