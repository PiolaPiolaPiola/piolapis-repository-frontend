import React, { useEffect, useState } from 'react';
import type { Project } from '../types';
import { projectService } from '../services/projectService';
import { ProjectListItem } from '../components/ProjectListItem';
import { projectSchema } from '../schemas/projectSchema';
import './ProjectsPage.css';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({ name: '', description: '', code: '' });

  useEffect(() => {
    fetchProjects();
  }, [includeInactive]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getAll(includeInactive);
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };
      const fieldSchema = projectSchema.shape[name as keyof typeof projectSchema.shape];

      if (fieldSchema) {
        const result = fieldSchema.safeParse(value);
        if (!result.success) {
          const issue = result.error.issues[0];
          setFieldErrors((prevErrors) => ({ ...prevErrors, [name]: issue?.message || 'Campo inválido' }));
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
    setFormData({ name: '', description: '', code: '' });
    setEditingId(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = projectSchema.safeParse(formData);
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
        await projectService.update(editingId, {
          name: result.data.name,
          description: result.data.description,
        });

        setProjects((prev) => prev.map((project) => project.id === editingId ? { ...project, name: result.data.name, description: result.data.description } : project));
        resetForm();
        return;
      }

      const normalizedCode = result.data.code.trim().toLowerCase();
      const duplicateProject = projects.some((project) => project.code?.trim().toLowerCase() === normalizedCode);

      if (duplicateProject) {
        setFieldErrors((prev) => ({ ...prev, code: 'Ya existe un proyecto con este código.' }));
        return;
      }

      const created = await projectService.create({
        name: result.data.name,
        description: result.data.description,
        code: result.data.code,
      });
      setProjects((prev) => [...prev, created]);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Error al guardar proyecto');
    }
  };

  const handleDelete = async (id: string | null) => {
    if (!id) return;
    if (!window.confirm('¿Eliminar proyecto?')) return;
    try {
      await projectService.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar proyecto');
    }
  };

  const handleEdit = (project: Project) => {
    if (!project.id) return;
    setFormData({ name: project.name, description: project.description, code: project.code || '' });
    setEditingId(project.id);
    setFieldErrors({});
  };

  const handleActivate = async (id: string | null, currentStatus: boolean | undefined) => {
    if (!id) return;
    try {
      const newStatus = !currentStatus;
      await projectService.changeStatus(id, newStatus);
      setProjects((prev) => {
        if (!newStatus && !includeInactive) {
          return prev.filter((project) => project.id !== id);
        }
        return prev.map((project) => project.id === id ? { ...project, isActive: newStatus } : project);
      });
    } catch (err: any) {
      setError(err.message || 'No se pudo cambiar el estado del proyecto.');
    }
  };

  return (
    <div>
      <h2 className="users-page__title">Administración de Proyectos</h2>

      {error && <div className="users-page__error"><strong>Error:</strong> {error}</div>}

      <form onSubmit={handleSubmit} className="users-page__form" noValidate>
        <div className="users-page__field-group">
          <label htmlFor="name" className="users-page__label">Nombre <span className="users-page__required">*</span></label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej. Plataforma API"
            className={`users-page__input ${fieldErrors.name ? 'users-page__input--error' : ''}`}
          />
          {fieldErrors.name && <span className="users-page__feedback-error">{fieldErrors.name}</span>}
        </div>

        <div className="users-page__field-group">
          <label htmlFor="code" className="users-page__label">Código <span className="users-page__required">*</span></label>
          <input
            name="code"
            value={formData.code}
            onChange={handleChange}
            placeholder="Ej. PLATFORM_API"
            className={`users-page__input ${fieldErrors.code ? 'users-page__input--error' : ''}`}
            disabled={Boolean(editingId)}
          />
          {fieldErrors.code && <span className="users-page__feedback-error">{fieldErrors.code}</span>}
        </div>

        <div className="users-page__field-group">
          <label htmlFor="description" className="users-page__label">Descripción <span className="users-page__required">*</span></label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe el propósito del proyecto"
            className={`users-page__input ${fieldErrors.description ? 'users-page__input--error' : ''}`}
            rows={4}
          />
          {fieldErrors.description && <span className="users-page__feedback-error">{fieldErrors.description}</span>}
        </div>

        <div className="users-page__actions">
          <button type="submit" className="users-page__button">{editingId ? 'Editar' : 'Registrar'}</button>
          {editingId && <button type="button" onClick={resetForm} className="users-page__button users-page__button--cancel">Cancelar edición</button>}
        </div>
      </form>

      <div className="users-page__list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px 0' }}>
        <h3 className="users-page__subtitle" style={{ margin: 0 }}>Proyectos existentes</h3>

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

      {loading ? <p>Cargando...</p> : projects.length === 0 ? <p>No se encontraron registros.</p> : (
        <ul className="users-page__list">
          {projects.map((project) => (
            <ProjectListItem
              key={project.id || ''}
              project={project}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onActivate={handleActivate}
            />
          ))}
        </ul>
      )}
    </div>
  );
};