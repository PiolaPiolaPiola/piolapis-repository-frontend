import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { TemplateDto, Variable } from '../types';
import { templateDtoService } from '../services/templateDtoService';
import { variableService } from '../services/variableService';
import { templateDtoSchema } from '../schemas/templateDtoSchema';
import { TemplateDtoListItem } from '../components/TemplateDtoListItem';
import { TemplateDtoPreviewModal } from '../components/TemplateDtoPreviewModal';
import './TemplateDtosPage.css';

const requestTypeOptions = [
  { value: '0', label: 'POST' },
  { value: '1', label: 'GET' },
  { value: '2', label: 'PUT' },
  { value: '3', label: 'PATCH' },
  { value: '4', label: 'DELETE' },
  { value: '5', label: 'OPTIONS' }
];

const responseTypeOptions = [
  { value: 'S', label: 'Schema' },
  { value: 'J', label: 'JSON' }
];

const contractViewOptions = [
  { value: 'Q', label: 'Request' },
  { value: 'P', label: 'Response' }
];

const sanitizeFieldName = (value: string) => value.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^_+|_+$/g, '') || 'field';

export const TemplateDtosPage: React.FC = () => {
  const [items, setItems] = useState<TemplateDto[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedVariableIds, setSelectedVariableIds] = useState<string[]>([]);
  const [previewItem, setPreviewItem] = useState<TemplateDto | null>(null);
  const [activeEditor, setActiveEditor] = useState<string>('Q');

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'Q',
    code: '',
    requestType: '0',
    request: '',
    response: '',
    responseType: 'J',
    isShared: true,
    tags: ''
  });

  const requestTypeNeedsRequestEditor = ['0', '2', '3'].includes(form.requestType);

  useEffect(() => {
    if (!requestTypeNeedsRequestEditor) {
      setActiveEditor('P');
    }
  }, [form.requestType, requestTypeNeedsRequestEditor]);

  useEffect(() => {
    void fetchAll();
    void fetchVariables();
  }, [includeInactive]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await templateDtoService.getAll(includeInactive);
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar plantillas DTO');
    } finally {
      setLoading(false);
    }
  };

  const fetchVariables = async () => {
    try {
      const data = await variableService.getAll(true);
      setVariables(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar variables');
    }
  };

  const reset = () => {
    setForm({
      name: '',
      description: '',
      type: 'Q',
      code: '',
      requestType: '0',
      request: '',
      response: '',
      responseType: 'J',
      isShared: true, 
      tags: ''
    });
    setEditingId(null);
    setFieldErrors({});
    setSelectedVariableIds([]);
    setActiveEditor('Q');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setForm((prev) => ({ ...prev, [name]: parsedValue }));

    if (name === 'request' || name === 'response') {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const clearRequestEditor = () => {
    setForm((prev) => ({ ...prev, request: '' }));
    setFieldErrors((prev) => ({ ...prev, request: '' }));
  };

  const clearResponseEditor = () => {
    setForm((prev) => ({ ...prev, response: '' }));
    setFieldErrors((prev) => ({ ...prev, response: '' }));
  };

  const handleSelectMultipleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedVariableIds(values);

    const selected = variables.filter((variable) => values.includes(variable.id || variable.name));
    const newVariablesContent = selected.map((variable) => `  ${sanitizeFieldName(variable.name)}: ${sanitizeFieldName(variable.exampleValue || 'X')} // ${variable.dataType || 'String'}`).join('\n');

    setForm((prev) => {
      const requestUpdated = prev.request.trim()
        ? prev.request.endsWith('}') 
          ? prev.request.slice(0, -1).trim() + ',\n' + newVariablesContent + '\n}'
          : prev.request.trim() + '\n' + newVariablesContent
        : '{\n' + newVariablesContent + '\n}';

      const responseUpdated = prev.response.trim()
        ? prev.response.endsWith('}')
          ? prev.response.slice(0, -1).trim() + ',\n' + newVariablesContent + '\n}'
          : prev.response.trim() + '\n' + newVariablesContent
        : '{\n' + newVariablesContent + '\n}';

      return {
        ...prev,
        request: requestUpdated,
        response: responseUpdated
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = templateDtoSchema.safeParse({ ...form, isShared: true });
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
        if (!window.confirm('¿Deseas actualizar esta plantilla DTO?')) return;
        
        await templateDtoService.update(editingId, {
          name: result.data.name,
          description: result.data.description,
          type: result.data.type,
          code: result.data.code || '',
          requestType: result.data.requestType,
          request: result.data.request,
          response: result.data.response,
          responseType: result.data.responseType,
          tags: result.data.tags || ''
        });
        setItems((prev) => prev.map((item) => item.id === editingId ? { ...item, name: result.data.name, description: result.data.description, type: result.data.type, code: result.data.code || '', requestType: result.data.requestType, request: result.data.request, response: result.data.response, responseType: result.data.responseType, isShared: true, tags: result.data.tags || '' } : item));
        alert('Plantilla DTO actualizada exitosamente');
        reset();
        return;
      }

      if (!window.confirm('¿Deseas crear esta plantilla DTO?')) return;
      
      const created = await templateDtoService.create({
        name: result.data.name,
        description: result.data.description,
        type: result.data.type,
        code: result.data.code || '',
        requestType: result.data.requestType,
        request: result.data.request,
        response: result.data.response,
        responseType: result.data.responseType,
        tags: result.data.tags || ''
      });
      setItems((prev) => [...prev, created]);
      alert('Plantilla DTO creada exitosamente');
      reset();
    } catch (err: any) {
      setError(err.message || 'Error al guardar plantilla DTO');
    }
  };

  const handleDelete = async (id?: string | null) => {
    if (!id) return;
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta plantilla DTO?')) return;
    try {
      await templateDtoService.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      alert('Plantilla DTO eliminada exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar plantilla DTO');
    }
  };

  const handleEdit = (item: TemplateDto) => {
    if (!item.id) return;
    setForm({
      name: item.name,
      description: item.description,
      type: item.type || 'Q',
      code: item.code || '',
      requestType: item.requestType,
      request: item.request,
      response: item.response,
      responseType: item.responseType,
      isShared: true,
      tags: item.tags || ''
    });
    setEditingId(item.id);
    setFieldErrors({});
    setActiveEditor(item.requestType && ['0', '2', '3'].includes(item.requestType) ? 'Q' : 'P');
  };

  const handleActivate = async (id: string | null, currentStatus: boolean | undefined) => {
    if (!id) return;
    try {
      const newStatus = !currentStatus;
      await templateDtoService.changeStatus(id, newStatus);
      setItems((prev) => {
        if (!newStatus && !includeInactive) {
          return prev.filter((item) => item.id !== id);
        }
        return prev.map((item) => item.id === id ? { ...item, isActive: newStatus } : item);
      });
    } catch (err: any) {
      setError(err.message || 'No se pudo cambiar el estado de la plantilla.');
    }
  };

  const handleView = async (item: TemplateDto) => {
    if (!item.id) return;
    try {
      const updated = await templateDtoService.getById(item.id);
      setPreviewItem(updated);
    } catch (err: any) {
      setError(err.message || 'Error al cargar la plantilla DTO');
      setPreviewItem(item);
    }
  };

  return (
    <div>
      <h2 className="users-page__title">Plantillas DTOs</h2>
      {error && <div className="users-page__error"><strong>Error:</strong> {error}</div>}

      <form onSubmit={handleSubmit} className="users-page__form" noValidate>
        <div className="users-page__field-group">
          <label className="users-page__label">Nombre <span className="users-page__required">*</span></label>
          <input name="name" value={form.name} onChange={handleChange} placeholder="Ej. Crear usuario" className={`users-page__input ${fieldErrors.name ? 'users-page__input--error' : ''}`} />
          {fieldErrors.name && <span className="users-page__feedback-error">{fieldErrors.name}</span>}
        </div>

        <div className="users-page__field-group">
          <label className="users-page__label">Descripción <span className="users-page__required">*</span></label>
          <input name="description" value={form.description} onChange={handleChange} placeholder="Descripción de la plantilla" className={`users-page__input ${fieldErrors.description ? 'users-page__input--error' : ''}`} />
          {fieldErrors.description && <span className="users-page__feedback-error">{fieldErrors.description}</span>}
        </div>

        <div className="users-page__field-group">
          <label className="users-page__label">Código</label>
          <input name="code" value={form.code} onChange={handleChange} placeholder="Ej. CreateUserDTO" className={`users-page__input ${fieldErrors.code ? 'users-page__input--error' : ''}`} />
          {fieldErrors.code && <span className="users-page__feedback-error">{fieldErrors.code}</span>}
        </div>

        <div className="users-page__field-group">
          <label className="users-page__label">Etiquetas</label>
          <input name="tags" value={form.tags} onChange={handleChange} placeholder="Ej. user, create, api" className="users-page__input" />
        </div>

        <div className="users-page__field-group">
          <label className="users-page__label">Tipo DTO <span className="users-page__required">*</span></label>
          <select 
            name="activeEditor" 
            value={activeEditor} 
            onChange={(e) => setActiveEditor(e.target.value)} 
            className="users-page__select"
          >
            {contractViewOptions.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.value === 'Q' && !requestTypeNeedsRequestEditor} 
              >
                {option.label} {option.value === 'Q' && !requestTypeNeedsRequestEditor ? ' (No admitido por método HTTP)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="users-page__field-group">
          <label className="users-page__label">Método de la petición <span className="users-page__required">*</span></label>
          <select name="requestType" value={form.requestType} onChange={handleChange} className={`users-page__select ${fieldErrors.requestType ? 'users-page__input--error' : ''}`}>
            <option value="">Seleccione un request</option>
            {requestTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          {fieldErrors.requestType && <span className="users-page__feedback-error">{fieldErrors.requestType}</span>}
        </div>

        <div className="users-page__field-group">
          <label className="users-page__label">Tipo de datos <span className="users-page__required">*</span></label>
          <select name="responseType" value={form.responseType} onChange={handleChange} className={`users-page__select ${fieldErrors.responseType ? 'users-page__input--error' : ''}`}>
            <option value="">Seleccione un tipo</option>
            {responseTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          {fieldErrors.responseType && <span className="users-page__feedback-error">{fieldErrors.responseType}</span>}
        </div>
            <div>
              
            </div>
        <div className="users-page__field-group" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="users-page__label">Variables disponibles</label>
            <select
              multiple
              value={selectedVariableIds}
              onChange={handleSelectMultipleChange}
              className="users-page__select template-dtos-page__select--multiple"
              size={Math.max(5, Math.min(variables.length || 5, 10))}
              style={{ flex: 1, height: '180px' }}
            >
              {variables.length === 0 ? (
                <option value="">No hay variables disponibles</option>
              ) : (
                variables.map((variable) => (
                  <option key={variable.id || variable.name} value={variable.id || variable.name}>
                    {variable.name} — {variable.dataType || 'String'}
                  </option>
                ))
              )}
            </select>
            <span className="users-page__feedback-hint">Selecciona una o varias variables (Ctrl+Click) para seleccionar varias.</span>
          </div>

          {requestTypeNeedsRequestEditor && activeEditor === 'Q' && (
            <div className="users-page__field-group" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <label className="users-page__label" style={{ margin: 0 }}>Cuerpo del request <span className="users-page__required">*</span></label>
                <button
                  type="button"
                  onClick={clearRequestEditor}
                  className="template-dtos-page__clear-button"
                  title="Limpiar editor de request"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <textarea
                name="request"
                value={form.request}
                onChange={handleChange}
                rows={8}
                style={{ flex: 1, height: '180px' }}
                className={`users-page__input template-dtos-page__editor ${fieldErrors.request ? 'users-page__input--error' : ''}`}
                placeholder="Ej. {\n  id: x // Int\n}"
              />
              {fieldErrors.request && <span className="users-page__feedback-error">{fieldErrors.request}</span>}
            </div>
          )}

          {activeEditor === 'P' && (
            <div className="users-page__field-group" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <label className="users-page__label" style={{ margin: 0 }}>Cuerpo del response <span className="users-page__required">*</span></label>
                <button
                  type="button"
                  onClick={clearResponseEditor}
                  className="template-dtos-page__clear-button"
                  title="Limpiar editor de response"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <textarea
                name="response"
                value={form.response}
                onChange={handleChange}
                rows={8}
                style={{ flex: 1, height: '180px' }}
                className={`users-page__input template-dtos-page__editor ${fieldErrors.response ? 'users-page__input--error' : ''}`}
              placeholder="Ej. {\n  status: string\n}"
            />
            {fieldErrors.response && <span className="users-page__feedback-error">{fieldErrors.response}</span>}
          </div>
          )}

        <div className="users-page__actions">
          <button type="submit" className="users-page__button">{editingId ? 'Editar' : 'Registrar'}</button>
          {editingId && <button type="button" onClick={reset} className="users-page__button users-page__button--cancel">Cancelar edición</button>}
        </div>
      </form>

      <div className="users-page__list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px 0' }}>
        <h3 className="users-page__subtitle" style={{ margin: 0 }}>Plantillas existentes</h3>

        <label className="users-page__checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
          <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} className="users-page__checkbox" />
          <span>Incluir inactivas</span>
        </label>
      </div>

      {loading ? <p>Cargando...</p> : items.length === 0 ? <p>No se encontraron registros.</p> : (
        <div className="template-dtos-page__list">
          {items.map((item) => (
            <TemplateDtoListItem key={item.id || ''} item={item} onDelete={handleDelete} onEdit={handleEdit} onActivate={handleActivate} onView={handleView} />
          ))}
        </div>
      )}

      {previewItem && (
        <TemplateDtoPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      )}
    </div>
  );
};