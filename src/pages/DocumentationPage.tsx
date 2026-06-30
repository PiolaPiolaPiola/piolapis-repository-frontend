import React, { useEffect, useState } from 'react';
import type { Documentation, Project, DocumentationSetting, TemplateDto, Variable } from '../types';
import { documentationService } from '../services/documentationService';
import { projectService } from '../services/projectService';
import { documentationSettingService } from '../services/documentationSettingService';
import { templateDtoService } from '../services/templateDtoService';
import { variableService } from '../services/variableService';
import { documentationSchema } from '../schemas/documentationSchema';
import { DocumentationListItem } from '../components/DocumentationListItem';
import { DocumentationErrorMessagesModal } from '../components/DocumentationErrorMessagesModal';
import { DocumentationPreviewModal } from '../components/DocumentationPreviewModal';
import './DocumentationPage.css';

const requestTypeOptions = [
  { value: '0', label: 'POST' },
  { value: '1', label: 'GET' },
  { value: '2', label: 'PUT' },
  { value: '3', label: 'PATCH' },
  { value: '4', label: 'DELETE' },
  { value: '5', label: 'OPTIONS' }
];

interface ErrorMessage {
  code: string;
  message: string;
}

export const DocumentationPage: React.FC = () => {
  const [items, setItems] = useState<Documentation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [docSettings, setDocSettings] = useState<DocumentationSetting[]>([]);
  const [templates, setTemplates] = useState<TemplateDto[]>([]);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [selectedVariableIds, setSelectedVariableIds] = useState<string[]>([]);
  const [filteredRequestTemplates, setFilteredRequestTemplates] = useState<TemplateDto[]>([]);
  const [filteredResponseTemplates, setFilteredResponseTemplates] = useState<TemplateDto[]>([]);
  const [selectedRequestTemplate, setSelectedRequestTemplate] = useState<TemplateDto | null>(null);
  const [selectedResponseTemplate, setSelectedResponseTemplate] = useState<TemplateDto | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessages, setErrorMessages] = useState<ErrorMessage[]>([]);
  const [previewItem, setPreviewItem] = useState<Documentation | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    version: '',
    proyectoId: '',
    configuracionDocumentacionId: '',
    requestDtoId: '',
    responseDtoId: '',
    requestTypeFilterForRequest: '',
    requestTypeFilterForResponse: '',
    endpointEspecifico: '',
    parametros: '',
    mensajesError: '',
    isPublica: false
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [docs, projs, settings, temps, vars] = await Promise.all([
        documentationService.getAll(form.proyectoId || undefined, includeInactive),
        projectService.getAll(),
        documentationSettingService.getAll(),
        templateDtoService.getAll(false),
        variableService.getAll()
      ]);
      setItems(docs);
      setProjects(projs);
      setDocSettings(settings);
      setTemplates(temps);
      setVariables(vars);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [includeInactive]);

  useEffect(() => {
    let filteredRequest = templates;
    let filteredResponse = templates;
    
    if (form.requestTypeFilterForRequest) {
      filteredRequest = templates.filter(t => t.requestType === form.requestTypeFilterForRequest);
    }
    if (form.requestTypeFilterForResponse) {
      filteredResponse = templates.filter(t => t.requestType === form.requestTypeFilterForResponse);
    }
    
    setFilteredRequestTemplates(filteredRequest);
    setFilteredResponseTemplates(filteredResponse);
  }, [templates, form.requestTypeFilterForRequest, form.requestTypeFilterForResponse]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name } = target;
    let inputValue: any;
    
    if (target.type === 'checkbox') {
      inputValue = target.checked;
    } else {
      inputValue = target.value;
    }
    
    setForm(prev => ({ ...prev, [name]: inputValue }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'requestDtoId') {
      const selected = templates.find(t => t.id === inputValue) || null;
      setSelectedRequestTemplate(selected);
    }

    if (name === 'responseDtoId') {
      const selected = templates.find(t => t.id === inputValue) || null;
      setSelectedResponseTemplate(selected);
    }

    if (name === 'configuracionDocumentacionId') {
      const selectedConfig = docSettings.find(ds => ds.id === inputValue);
      if (selectedConfig && selectedConfig.baseEndpoint) {
        setForm(prev => ({ ...prev, endpointEspecifico: selectedConfig.baseEndpoint }));
      }
    }
  };

  const handleSelectMultipleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedVariableIds(selected);

    const selectedVars = variables.filter(v => selected.includes(v.id || v.name));
    const varNamesJson = selectedVars.map(v => `"${v.name}": ${v.dataType || 'string'}`).join(',\n');
    
    if (varNamesJson && form.parametros) {
      const params = form.parametros.replace(/\n$/, '') + ',\n' + varNamesJson;
      setForm(prev => ({ ...prev, parametros: params }));
    } else if (varNamesJson) {
      setForm(prev => ({ ...prev, parametros: varNamesJson }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const payload = {
      name: form.name,
      description: form.description,
      version: form.version,
      proyectoId: form.proyectoId,
      configuracionDocumentacionId: form.configuracionDocumentacionId,
      plantillaDtoIdRequest: form.requestDtoId || undefined,
      plantillaDtoResponse: form.responseDtoId || undefined,
      endpointEspecifico: form.endpointEspecifico,
      parametros: form.parametros || undefined,
      mensajesError: errorMessages.length > 0 ? JSON.stringify(errorMessages) : undefined,
      isPublic: form.isPublica
    };

    try {
      documentationSchema.parse(payload);

      if (editingId) {
        if (!window.confirm('¿Deseas actualizar esta documentación?')) return;
        await documentationService.update(editingId, payload);
        setError(null);
        alert('Documentación actualizada exitosamente');
      } else {
        if (!window.confirm('¿Deseas crear esta documentación?')) return;
        await documentationService.create(payload as any);
        setError(null);
        alert('Documentación creada exitosamente');
      }

      reset();
      await fetchAllData();
    } catch (err: any) {
      if (err.errors) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          const path = e.path.join('.');
          newErrors[path] = e.message;
        });
        setFieldErrors(newErrors);
      } else {
        setError(err.message || 'Error al guardar documentación');
      }
    }
  };

  const reset = () => {
    setForm({
      name: '',
      description: '',
      version: '',
      proyectoId: '',
      configuracionDocumentacionId: '',
      requestDtoId: '',
      responseDtoId: '',
      requestTypeFilterForRequest: '',
      requestTypeFilterForResponse: '',
      endpointEspecifico: '',
      parametros: '',
      mensajesError: '',
      isPublica: false
    });
    setSelectedVariableIds([]);
    setSelectedRequestTemplate(null);
    setSelectedResponseTemplate(null);
    setErrorMessages([]);
    setEditingId(null);
    setFieldErrors({});
  };

  const handleEdit = (item: Documentation) => {
    setForm({
      name: item.name,
      description: item.description,
      version: item.version,
      proyectoId: item.proyectoId,
      configuracionDocumentacionId: item.configuracionDocumentacionId,
      requestDtoId: item.plantillaDtoIdRequest || '',
      responseDtoId: item.plantillaDtoResponse || '',
      requestTypeFilterForRequest: '',
      requestTypeFilterForResponse: '',
      endpointEspecifico: item.endpointEspecifico || '',
      parametros: item.parametros || '',
      mensajesError: item.mensajesError || '',
      isPublica: item.isPublic || false
    });
    const selectedRequest = templates.find(t => t.id === item.plantillaDtoIdRequest) || null;
    const selectedResponse = templates.find(t => t.id === item.plantillaDtoResponse) || null;
    setSelectedRequestTemplate(selectedRequest);
    setSelectedResponseTemplate(selectedResponse);
    
    if (item.mensajesError) {
      try {
        setErrorMessages(JSON.parse(item.mensajesError));
      } catch {
        setErrorMessages([]);
      }
    }
    
    setEditingId(item.id || null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta documentación?')) return;
    try {
      await documentationService.delete(id);
      alert('Documentación eliminada exitosamente');
      await fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar documentación');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    if (!window.confirm(`¿Deseas ${isActive ? 'activar' : 'desactivar'} esta documentación?`)) return;
    try {
      await documentationService.changeStatus(id, isActive);
      alert('Estado actualizado exitosamente');
      await fetchAllData();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado');
    }
  };

  const handleView = (item: Documentation) => {
    setPreviewItem(item);
  };

  if (loading) return <div className="documentation-page"><p>Cargando...</p></div>;

  return (
    <div className="documentation-page">
      <h2 className="documentation-page__title">Documentaciones</h2>

      {error && <div className="documentation-page__error">{error}</div>}

      <form onSubmit={handleSubmit} className="documentation-page__form">
        <div className="documentation-page__field-group">
          <label className="documentation-page__label">Nombre <span className="documentation-page__required">*</span></label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nombre de la documentación"
            className={`documentation-page__input ${fieldErrors.name ? 'documentation-page__input--error' : ''}`}
          />
          {fieldErrors.name && <span className="documentation-page__feedback-error">{fieldErrors.name}</span>}
        </div>

        <div className="documentation-page__field-group">
          <label className="documentation-page__label">Descripción <span className="documentation-page__required">*</span></label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción de la documentación"
            rows={2}
            className={`documentation-page__input ${fieldErrors.description ? 'documentation-page__input--error' : ''}`}
          />
          {fieldErrors.description && <span className="documentation-page__feedback-error">{fieldErrors.description}</span>}
        </div>

        <div className="documentation-page__field-group">
          <label className="documentation-page__label">Versión <span className="documentation-page__required">*</span></label>
          <input
            name="version"
            value={form.version}
            onChange={handleChange}
            placeholder="Ej. 1.0.0"
            className={`documentation-page__input ${fieldErrors.version ? 'documentation-page__input--error' : ''}`}
          />
          {fieldErrors.version && <span className="documentation-page__feedback-error">{fieldErrors.version}</span>}
        </div>

        <div className="documentation-page__field-group">
          <label className="documentation-page__label">Proyecto <span className="documentation-page__required">*</span></label>
          <select
            name="proyectoId"
            value={form.proyectoId}
            onChange={handleChange}
            className={`documentation-page__select ${fieldErrors.proyectoId ? 'documentation-page__input--error' : ''}`}
          >
            <option value="">Selecciona un proyecto</option>
            {projects.map(p => p.id && (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {fieldErrors.proyectoId && <span className="documentation-page__feedback-error">{fieldErrors.proyectoId}</span>}
        </div>

        <div className="documentation-page__field-group">
          <label className="documentation-page__label">Configuración de Documentación <span className="documentation-page__required">*</span></label>
          <select
            name="configuracionDocumentacionId"
            value={form.configuracionDocumentacionId}
            onChange={handleChange}
            className={`documentation-page__select ${fieldErrors.configuracionDocumentacionId ? 'documentation-page__input--error' : ''}`}
          >
            <option value="">Selecciona una configuración</option>
            {docSettings.map(ds => ds.id && (
              <option key={ds.id} value={ds.id}>{ds.name}</option>
            ))}
          </select>
          {fieldErrors.configuracionDocumentacionId && <span className="documentation-page__feedback-error">{fieldErrors.configuracionDocumentacionId}</span>}
        </div>

        <div className="documentation-page__field-group">
          <label className="documentation-page__label">Filtrar Request DTO por tipo de petición</label>
          <select
            name="requestTypeFilterForRequest"
            value={form.requestTypeFilterForRequest}
            onChange={handleChange}
            className="documentation-page__select"
          >
            <option value="">Todas las plantillas</option>
            {requestTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="documentation-page__field-group">
          <label className="documentation-page__label">Request DTO</label>
          <select
            name="requestDtoId"
            value={form.requestDtoId}
            onChange={handleChange}
            className={`documentation-page__select ${fieldErrors.requestDtoId ? 'documentation-page__input--error' : ''}`}
          >
            <option value="">Selecciona un Request DTO</option>
            {filteredRequestTemplates.map(t => t.id && (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {fieldErrors.requestDtoId && <span className="documentation-page__feedback-error">{fieldErrors.requestDtoId}</span>}
        </div>

        {selectedRequestTemplate && (
          <div className="documentation-page__template-preview">
            <h4 className="documentation-page__preview-title">Vista previa de Request DTO</h4>
            {selectedRequestTemplate.request && (
              <div className="documentation-page__editor-group">
                <label className="documentation-page__label">Request</label>
                <textarea
                  readOnly
                  value={selectedRequestTemplate.request || ''}
                  className="documentation-page__editor-readonly"
                />
              </div>
            )}
          </div>
        )}

        <div className="documentation-page__field-group">
          <label className="documentation-page__label">Filtrar Response DTO por tipo de petición</label>
          <select
            name="requestTypeFilterForResponse"
            value={form.requestTypeFilterForResponse}
            onChange={handleChange}
            className="documentation-page__select"
          >
            <option value="">Todas las plantillas</option>
            {requestTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="documentation-page__field-group">
          <label className="documentation-page__label">Response DTO</label>
          <select
            name="responseDtoId"
            value={form.responseDtoId}
            onChange={handleChange}
            className={`documentation-page__select ${fieldErrors.responseDtoId ? 'documentation-page__input--error' : ''}`}
          >
            <option value="">Selecciona un Response DTO</option>
            {filteredResponseTemplates.map(t => t.id && (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {fieldErrors.responseDtoId && <span className="documentation-page__feedback-error">{fieldErrors.responseDtoId}</span>}
        </div>

        {selectedResponseTemplate && (
          <div className="documentation-page__template-preview">
            <h4 className="documentation-page__preview-title">Vista previa de Response DTO</h4>
            {selectedResponseTemplate.response && (
              <div className="documentation-page__editor-group">
                <label className="documentation-page__label">Response</label>
                <textarea
                  readOnly
                  value={selectedResponseTemplate.response || ''}
                  className="documentation-page__editor-readonly"
                />
              </div>
            )}
          </div>
        )}

        <div className="documentation-page__field-group">
          <label className="documentation-page__label">Endpoint específico <span className="documentation-page__required">*</span></label>
          <input
            name="endpointEspecifico"
            value={form.endpointEspecifico}
            onChange={handleChange}
            placeholder="Ej. /api/users/:id, /api/products?limit=10"
            required
            className={`documentation-page__input ${fieldErrors.endpointEspecifico ? 'documentation-page__input--error' : ''}`}
          />
          {fieldErrors.endpointEspecifico && <span className="documentation-page__feedback-error">{fieldErrors.endpointEspecifico}</span>}
        </div>

        <div className="documentation-page__field-group">
          <label className="documentation-page__label">Variables para parámetros</label>
          <select
            multiple
            value={selectedVariableIds}
            onChange={handleSelectMultipleChange}
            className="documentation-page__select documentation-page__select--multiple"
            size={5}
          >
            {variables.length === 0 ? (
              <option value="">No hay variables disponibles</option>
            ) : (
              variables.map(v => (
                <option key={v.id || v.name} value={v.id || v.name}>
                  {v.name} — {v.dataType || 'String'}
                </option>
              ))
            )}
          </select>
          <span className="documentation-page__feedback-hint">Selecciona variables para inyectarlas en los parámetros</span>
        </div>

        <div className="documentation-page__field-group">
          <label className="documentation-page__label">Parámetros</label>
          <textarea
            name="parametros"
            value={form.parametros}
            onChange={handleChange}
            placeholder="Parámetros en formato JSON o texto"
            rows={4}
            className="documentation-page__input"
          />
        </div>

        <div className="documentation-page__field-group">
          <label className="documentation-page__checkbox-label">
            <input
              type="checkbox"
              name="isPublica"
              checked={form.isPublica}
              onChange={handleChange}
              className="documentation-page__checkbox"
            />
            <span>API Pública</span>
          </label>
        </div>

        <button
          type="button"
          onClick={() => setShowErrorModal(true)}
          className="users-page__button"
        >
          Gestionar Mensajes de Error ({errorMessages.length})
        </button>

        <div className="documentation-page__actions">
          <button type="submit" className="users-page__button">{editingId ? 'Editar' : 'Crear'}</button>
          {editingId && <button type="button" onClick={reset} className="users-page__button users-page__button--cancel">Cancelar</button>}
        </div>
      </form>

      <div className="documentation-page__list-header">
        <h3 className="documentation-page__subtitle">Documentaciones existentes</h3>
        <label className="documentation-page__checkbox-label">
          <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} className="documentation-page__checkbox" />
          <span>Incluir inactivas</span>
        </label>
      </div>

      <div className="documentation-page__list">
        {items.length === 0 ? (
          <p className="documentation-page__empty">No hay documentaciones</p>
        ) : (
          items.map(item => (
            <DocumentationListItem
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onToggleStatus={handleToggleStatus}
            />
          ))
        )}
      </div>

      {showErrorModal && (
        <DocumentationErrorMessagesModal
          errorMessages={errorMessages}
          onSave={setErrorMessages}
          onClose={() => setShowErrorModal(false)}
        />
      )}

      {previewItem && (
        <DocumentationPreviewModal
          item={previewItem}
          templates={templates}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
};
