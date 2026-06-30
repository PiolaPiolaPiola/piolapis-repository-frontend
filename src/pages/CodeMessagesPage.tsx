import React, { useEffect, useState } from 'react';
import type { CodeMessage } from '../types';
import { codeMessageService } from '../services/codeMessageService';
import { CodeMessageListItem } from '../components/CodeMessageListItem';
import { codeMessageSchema } from '../schemas/codeMessageSchema';
import './CodeMessagesPage.css';

const commonHttpCodes = ['200', '201', '204', '400', '401', '403', '404', '409', '500'];
const responseTypeOptions = [
  { value: 'S', label: 'Schema' },
  { value: 'J', label: 'JSON' },
];

const buildResponseExample = (httpCode: string, description: string, responseType: string) => {
  const normalizedCode = httpCode?.trim() || '200';
  const message = (description?.trim() || 'Ocurrió un error desconocido').replace(/"/g, '\\"');

  if (responseType === 'S') {
    return `type ErrorResponse {\n  code: Int\n  message: String\n}\n\n{\n  code: ${normalizedCode},\n  message: "${message}"\n}`;
  }

  return `{
  "code": ${normalizedCode},
  "message": "${message}"
}`;
};

export const CodeMessagesPage: React.FC = () => {
  const [items, setItems] = useState<CodeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({ name: '', description: '', httpCode: '200', response: '', responseType: 'J' });

  useEffect(() => { fetchAll(); }, [includeInactive]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await codeMessageService.getAll(includeInactive);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar mensajes/códigos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updatedForm = { ...prev, [name]: value };
      const fieldSchema = codeMessageSchema.shape[name as keyof typeof codeMessageSchema.shape];

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

      if ((name === 'httpCode' || name === 'description' || name === 'responseType') && !prev.response.trim()) {
        const nextHttpCode = name === 'httpCode' ? value : prev.httpCode;
        const nextDescription = name === 'description' ? value : prev.description;
        const nextResponseType = name === 'responseType' ? value : prev.responseType;
        updatedForm.response = buildResponseExample(nextHttpCode, nextDescription, nextResponseType);
      }

      return updatedForm;
    });
  };

  const reset = () => {
    setForm({ name: '', description: '', httpCode: '200', response: '', responseType: 'J' });
    setEditingId(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = codeMessageSchema.safeParse(form);
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
        if (!window.confirm('¿Deseas actualizar este código?')) return;
        
        await codeMessageService.update(editingId, {
          name: result.data.name,
          description: result.data.description,
          httpCode: result.data.httpCode,
          response: result.data.response,
          responseType: result.data.responseType,
        });
        setItems((prev) => prev.map((p) => p.id === editingId ? { ...p, name: result.data.name, description: result.data.description, httpCode: result.data.httpCode, response: result.data.response, responseType: result.data.responseType } : p));
        alert('Código actualizado exitosamente');
        reset();
        return;
      }

      if (!window.confirm('¿Deseas crear este código?')) return;
      
      const created = await codeMessageService.create({
        name: result.data.name,
        description: result.data.description,
        httpCode: result.data.httpCode,
        response: result.data.response,
        responseType: result.data.responseType,
      });
      setItems((prev) => [...prev, created]);
      alert('Código creado exitosamente');
      reset();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el código');
    }
  };

  const handleDelete = async (id?: string | null) => {
    if (!id) return;
    if (!window.confirm('¿Estás seguro de que deseas eliminar este código?')) return;
    try {
      await codeMessageService.delete(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      alert('Código eliminado exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar código');
    }
  };

  const handleEdit = (item: CodeMessage) => {
    if (!item.id) return;
    setForm({
      name: item.name,
      description: item.description,
      httpCode: item.httpCode,
      response: item.response,
      responseType: item.responseType,
    });
    setEditingId(item.id);
    setFieldErrors({});
  };

  const handleActivate = async (id: string | null, currentStatus: boolean | undefined) => {
    if (!id) return;
    try {
      const newStatus = !currentStatus;
      await codeMessageService.changeStatus(id, newStatus);
      setItems((prev) => {
        if (!newStatus && !includeInactive) {
          return prev.filter((item) => item.id !== id);
        }
        return prev.map((item) => item.id === id ? { ...item, isActive: newStatus } : item);
      });
    } catch (err: any) {
      setError(err.message || 'No se pudo cambiar el estado del código.');
    }
  };

  const responsePlaceholder = form.responseType === 'S' ? 'Ej. {\n  "id": "123"\n}' : '{\n  "message": "ok"\n}';

  return (
    <div>
      <h2 className="users-page__title">Mensajes / Códigos</h2>
      {error && <div className="users-page__error"><strong>Error:</strong> {error}</div>}

      <form onSubmit={handleSubmit} className="users-page__form" noValidate>
        <div className="users-page__field-group">
          <label className="users-page__label">Nombre <span className="users-page__required">*</span></label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Ej. Crear usuario" className={`users-page__input ${fieldErrors.name ? 'users-page__input--error' : ''}`} />
          {fieldErrors.name && <span className="users-page__feedback-error">{fieldErrors.name}</span>}
        </div>
        <div className="users-page__field-group">
          <label className="usyers-page__label">Descripción <span className="users-page__required">*</span></label>
          <input name="description" value={form.description} onChange={handleChange} placeholder="Descripción del mensaje/código" className={`users-page__input ${fieldErrors.description ? 'users-page__input--error' : ''}`} />
          {fieldErrors.description && <span className="users-page__feedback-error">{fieldErrors.description}</span>}
        </div>
        <div className="users-page__field-group">
          <label className="users-page__label">Código HTTP <span className="users-page__required">*</span></label>
          <select name="httpCode" value={form.httpCode} onChange={handleChange} className={`users-page__select ${fieldErrors.httpCode ? 'users-page__input--error' : ''}`}>
            <option value="">Seleccione un código</option>
            {commonHttpCodes.map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
          {fieldErrors.httpCode && <span className="users-page__feedback-error">{fieldErrors.httpCode}</span>}
        </div>
        <div className="users-page__field-group">
          <label className="users-page__label">Tipo de respuesta <span className="users-page__required">*</span></label>
          <select name="responseType" value={form.responseType} onChange={handleChange} className={`users-page__select ${fieldErrors.responseType ? 'users-page__input--error' : ''}`}>
            {responseTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          {fieldErrors.responseType && <span className="users-page__feedback-error">{fieldErrors.responseType}</span>}
        </div>
        <div className="users-page__field-group">
          <label className="users-page__label">Respuesta <span className="users-page__required">*</span></label>
          <textarea
            name="response"
            value={form.response}
            onChange={handleChange}
            placeholder={responsePlaceholder}
            className={`users-page__input code-messages-page__editor ${form.responseType === 'S' ? 'code-messages-page__editor--schema' : 'code-messages-page__editor--json'}`}
            rows={8}
          />
          {fieldErrors.response && <span className="users-page__feedback-error">{fieldErrors.response}</span>}
        </div>

        <div className="users-page__actions">
          <button type="submit" className="users-page__button">{editingId ? 'Editar' : 'Registrar'}</button>
          {editingId && <button type="button" onClick={reset} className="users-page__button users-page__button--cancel">Cancelar edición</button>}
        </div>
      </form>

      <div className="users-page__list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px 0' }}>
        <h3 className="users-page__subtitle" style={{ margin: 0 }}>Códigos existentes</h3>

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

      {loading ? <p>Cargando...</p> : items.length === 0 ? <p>No se encontraron registros.</p> : (
        <div className="code-messages-page__list">
          {items.map((item) => (
            <CodeMessageListItem
              key={item.id || ''}
              item={item}
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
