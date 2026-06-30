import React from 'react';
import type { TemplateDto } from '../types';
import './TemplateDtoPreviewModal.css';

interface TemplateDtoPreviewModalProps {
  item: TemplateDto;
  onClose: () => void;
}

export const TemplateDtoPreviewModal: React.FC<TemplateDtoPreviewModalProps> = ({
  item,
  onClose,
}) => {
  const isRequestView = item.type === 'Q';
  const isResponseView = item.type === 'P';

  const requestTypeLabel: Record<string, string> = {
    '0': 'POST',
    '1': 'GET',
    '2': 'PUT',
    '3': 'PATCH',
    '4': 'DELETE',
    '5': 'OPTIONS',
  };

  const responseTypeLabel: Record<string, string> = {
    S: 'Schema',
    J: 'JSON',
  };

  return (
    <>
      <div className="template-dto-preview-modal__overlay" onClick={onClose} />
      <div className="template-dto-preview-modal__slide">
        <div className="template-dto-preview-modal__header">
          <div>
            <h3 className="template-dto-preview-modal__title">{item.name}</h3>
            <div className="template-dto-preview-modal__meta">
              <span className="template-dto-preview-modal__badge">
                {isRequestView ? 'Request' : 'Response'}
              </span>
              <span className="template-dto-preview-modal__badge">
                {requestTypeLabel[item.requestType] || item.requestType}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="template-dto-preview-modal__close"
            onClick={onClose}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="template-dto-preview-modal__content">
          <div className="template-dto-preview-modal__section">
            <label className="template-dto-preview-modal__label">
              Fecha de creación:
            </label>
            <p className="template-dto-preview-modal__value">
              {item.createdDate
                ? new Date(item.createdDate).toLocaleString()
                : 'N/A'}
            </p>
          </div>

          {item.code && (
            <div className="template-dto-preview-modal__section">
              <label className="template-dto-preview-modal__label">
                Código:
              </label>
              <p className="template-dto-preview-modal__value">{item.code}</p>
            </div>
          )}

          {item.tags && (
            <div className="template-dto-preview-modal__section">
              <label className="template-dto-preview-modal__label">
                Etiquetas:
              </label>
              <p className="template-dto-preview-modal__value">{item.tags}</p>
            </div>
          )}

          <div className="template-dto-preview-modal__section">
            <label className="template-dto-preview-modal__label">
              Descripción:
            </label>
            <p className="template-dto-preview-modal__value">
              {item.description}
            </p>
          </div>

          {isRequestView && (
            <div className="template-dto-preview-modal__section">
              <label className="template-dto-preview-modal__label">
                Request ({responseTypeLabel[item.responseType] || item.responseType}):
              </label>
              <textarea
                readOnly
                value={item.request || ''}
                className="template-dto-preview-modal__code"
                style={{ fontFamily: "'Consolas', 'Monaco', monospace", fontSize: '0.85rem', padding: '0.75rem 1rem', minHeight: '200px', resize: 'vertical' }}
              />
            </div>
          )}

          {isResponseView && (
            <div className="template-dto-preview-modal__section">
              <label className="template-dto-preview-modal__label">
                Response ({responseTypeLabel[item.responseType] || item.responseType}):
              </label>
              <textarea
                readOnly
                value={item.response || ''}
                className="template-dto-preview-modal__code"
                style={{ fontFamily: "'Consolas', 'Monaco', monospace", fontSize: '0.85rem', padding: '0.75rem 1rem', minHeight: '200px', resize: 'vertical' }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
