import React, { useEffect, useState } from 'react';
import type { Variable } from '../types';
import { variableService } from '../services/variableService';
import { VariableListItem } from '../components/VariableListItem';
import { variableSchema } from '../schemas/variableSchema';
import './VariablesPage.css';

export const VariablesPage: React.FC = () => {
  const [items, setItems] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({ name: '', description: '', dataType: '', exampleValue: '' });

  useEffect(() => { fetchAll(); }, [includeInactive]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await variableService.getAll(includeInactive);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar variables');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updatedForm = { ...prev, [name]: value };
      const fieldSchema = variableSchema.shape[name as keyof typeof variableSchema.shape];

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

  const reset = () => {
    setForm({ name: '', description: '', dataType: '', exampleValue: '' });
    setEditingId(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = variableSchema.safeParse(form);
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
        if (!window.confirm('¿Deseas actualizar esta variable?')) return;
        
        await variableService.update(editingId, {
          description: result.data.description,
          dataType: result.data.dataType,
          exampleValue: result.data.exampleValue || null,
        });

        setItems((prev) => prev.map((item) => item.id === editingId ? { ...item, description: result.data.description, dataType: result.data.dataType, exampleValue: result.data.exampleValue || null } : item));
        alert('Variable actualizada exitosamente');
        reset();
        return;
      }

      if (!window.confirm('¿Deseas crear esta variable?')) return;
      
      const created = await variableService.create({
        name: result.data.name,
        description: result.data.description,
        dataType: result.data.dataType,
        exampleValue: result.data.exampleValue || null,
      });
      setItems((prev) => [...prev, created]);
      alert('Variable creada exitosamente');
      reset();
    } catch (err: any) {
      setError(err.message || 'Error al guardar variable');
    }
  };

  const handleDelete = async (id?: string | null) => {
    if (!id) return;
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta variable?')) return;
    try {
      await variableService.delete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      alert('Variable eliminada exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar variable');
    }
  };

  const handleEdit = (item: Variable) => {
    if (!item.id) return;
    setForm({
      name: item.name,
      description: item.description,
      dataType: item.dataType,
      exampleValue: item.exampleValue || '',
    });
    setEditingId(item.id);
    setFieldErrors({});
  };

  const handleActivate = async (id: string | null, currentStatus: boolean | undefined) => {
    if (!id) return;
    try {
      const newStatus = !currentStatus;
      await variableService.changeStatus(id, newStatus);
      setItems((prev) => {
        if (!newStatus && !includeInactive) {
          return prev.filter((item) => item.id !== id);
        }
        return prev.map((item) => item.id === id ? { ...item, isActive: newStatus } : item);
      });
    } catch (err: any) {
      setError(err.message || 'No se pudo cambiar el estado de la variable.');
    }
  };

  return (
    <div>
      <h2 className="users-page__title">Administración de Variables</h2>
      {error && <div className="users-page__error"><strong>Error:</strong> {error}</div>}

      <form onSubmit={handleSubmit} className="users-page__form" noValidate>
        <div className="users-page__field-group">
        <label 
            htmlFor="name" 
            className="users-page__label"
            title="Una vez creada la propiedad, no se puede cambiar el nombre."
            style={{ cursor: 'help' }}
          >
            Nombre <span className="users-page__required">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ej. API_KEY"
            className={`users-page__input ${fieldErrors.name ? 'users-page__input--error' : ''}`}
            disabled={Boolean(editingId)}
          />
          {fieldErrors.name && <span className="users-page__feedback-error">{fieldErrors.name}</span>}
        </div>

        <div className="users-page__field-group">
          <label htmlFor="dataType" className="users-page__label">Tipo de dato <span className="users-page__required">*</span></label>
          <select
            name="dataType"
            value={form.dataType}
            onChange={handleChange}
            className={`users-page__select ${fieldErrors.dataType ? 'users-page__input--error' : ''}`}
          >
            <option value="">Seleccione tipo</option>
            <option value="String">String</option>
            <option value="Int">Int</option>
            <option value="Bool">Bool</option>
          </select>
          {fieldErrors.dataType && <span className="users-page__feedback-error">{fieldErrors.dataType}</span>}
        </div>

        <div className="users-page__field-group">
          <label htmlFor="description" className="users-page__label">Descripción <span className="users-page__required">*</span></label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción de la variable"
            className={`users-page__input ${fieldErrors.description ? 'users-page__input--error' : ''}`}
          />
          {fieldErrors.description && <span className="users-page__feedback-error">{fieldErrors.description}</span>}
        </div>

        <div className="users-page__field-group">
          <label htmlFor="exampleValue" className="users-page__label">Valor de ejemplo</label>
          <input
            name="exampleValue"
            value={form.exampleValue}
            onChange={handleChange}
            placeholder="Ej. 12345 o true"
            className={`users-page__input ${fieldErrors.exampleValue ? 'users-page__input--error' : ''}`}
          />
          {fieldErrors.exampleValue && <span className="users-page__feedback-error">{fieldErrors.exampleValue}</span>}
        </div>

        <div className="users-page__actions">
          <button type="submit" className="users-page__button">{editingId ? 'Editar' : 'Registrar'}</button>
          {editingId && <button type="button" onClick={reset} className="users-page__button users-page__button--cancel">Cancelar edición</button>}
        </div>
      </form>

      <div className="users-page__list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px 0' }}>
        <h3 className="users-page__subtitle" style={{ margin: 0 }}>Variables existentes</h3>

        <label className="users-page__checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="users-page__checkbox"
          />
          <span>Incluir inactivas</span>
        </label>
      </div>

      {loading ? <p>Cargando...</p> : items.length === 0 ? <p>No se encontraron registros.</p> : (
        <div className="variables-page__list">
          {items.map((item) => (
            <VariableListItem
              key={item.id || ''}
              variable={item}
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
