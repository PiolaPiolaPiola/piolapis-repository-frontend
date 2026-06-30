import React, { useEffect, useState } from 'react';
import type { Documentation, TemplateDto } from '../types';
import { documentationService } from '../services/documentationService';
import './DocumentationPreviewModal.css';

interface DocumentationPreviewModalProps {
  item: Documentation;
  templates: TemplateDto[];
  onClose: () => void;
}

export const DocumentationPreviewModal: React.FC<DocumentationPreviewModalProps> = ({
  item,
  templates,
  onClose,
}) => {
  const [documentation, setDocumentation] = useState<Documentation>(item);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocumentation = async () => {
      if (!item.id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await documentationService.getById(item.id);
        setDocumentation(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la documentación');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentation();
  }, [item.id]);

  const requestTemplate = templates.find(t => t.id === documentation.plantillaDtoIdRequest);
  const responseTemplate = templates.find(t => t.id === documentation.plantillaDtoResponse);

  let errorMessages: Array<{ code: string; message: string }> = [];
  try {
    if (documentation.mensajesError) {
      errorMessages = JSON.parse(documentation.mensajesError);
    }
  } catch {
    errorMessages = [];
  }

  const responseTypeLabel: Record<string, string> = {
    S: 'Schema',
    J: 'JSON',
  };

  if (loading) {
    return (
      <>
        <div className="documentation-preview-modal__overlay" onClick={onClose} />
        <div className="documentation-preview-modal__slide">
          <div className="documentation-preview-modal__content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Cargando...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="documentation-preview-modal__overlay" onClick={onClose} />
      <div className="documentation-preview-modal__slide">
        <div className="documentation-preview-modal__header">
          <div>
            <h3 className="documentation-preview-modal__title">{documentation.name}</h3>
            <div className="documentation-preview-modal__meta">
              <span className="documentation-preview-modal__badge">
                v{documentation.version}
              </span>
              <span className="documentation-preview-modal__badge">
                Creado: {new Date(documentation.createdDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="documentation-preview-modal__close"
            onClick={onClose}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="documentation-preview-modal__content">
          {error && (
            <div className="documentation-preview-modal__error-banner">
              {error}
            </div>
          )}

          <div className="documentation-preview-modal__section">
            <label className="documentation-preview-modal__label">
              Descripción
            </label>
            <p className="documentation-preview-modal__value">
              {documentation.description}
            </p>
          </div>

          <div className="documentation-preview-modal__section">
            <label className="documentation-preview-modal__label">
              Endpoint
            </label>
            <p className="documentation-preview-modal__value">
              {documentation.endpointEspecifico || 'N/A'}
            </p>
          </div>

          {documentation.parametros && (
            <div className="documentation-preview-modal__section">
              <label className="documentation-preview-modal__label">
                Parámetros de Query String
              </label>
              <pre className="documentation-preview-modal__code">
                {documentation.parametros}
              </pre>
            </div>
          )}

          {errorMessages.length > 0 && (
            <div className="documentation-preview-modal__section">
              <label className="documentation-preview-modal__label">
                Mensajes
              </label>
              <div className="documentation-preview-modal__error-list">
                {errorMessages.map((err, index) => (
                  <div key={index} className="documentation-preview-modal__error-item">
                    <span className="documentation-preview-modal__error-code">
                      {err.code}
                    </span>
                    <span className="documentation-preview-modal__error-message">
                      {err.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {requestTemplate && requestTemplate.request && (
            <div className="documentation-preview-modal__section">
              <label className="documentation-preview-modal__label">
                Request ({responseTypeLabel[requestTemplate.responseType] || requestTemplate.responseType})
              </label>
              <textarea
                readOnly
                value={requestTemplate.request || ''}
                className="documentation-preview-modal__code"
                style={{ fontFamily: "'Consolas', 'Monaco', monospace", fontSize: '0.85rem', padding: '0.75rem 1rem', minHeight: '200px', resize: 'vertical' }}
              />
            </div>
          )}

          {responseTemplate && responseTemplate.response && (
            <div className="documentation-preview-modal__section">
              <label className="documentation-preview-modal__label">
                Response ({responseTypeLabel[responseTemplate.responseType] || responseTemplate.responseType})
              </label>
              <textarea
                readOnly
                value={responseTemplate.response || ''}
                className="documentation-preview-modal__code"
                style={{ fontFamily: "'Consolas', 'Monaco', monospace", fontSize: '0.85rem', padding: '0.75rem 1rem', minHeight: '200px', resize: 'vertical' }}
              />
            </div>
          )}

          <div className="documentation-preview-modal__section">
            <label className="documentation-preview-modal__label">
              Estado
            </label>
            <p className="documentation-preview-modal__value">
              <span className={`documentation-preview-modal__status ${documentation.isActive ? 'documentation-preview-modal__status--active' : 'documentation-preview-modal__status--inactive'}`}>
                {documentation.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
