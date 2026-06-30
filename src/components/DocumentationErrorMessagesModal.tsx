import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import type { CodeMessage } from '../types';
import { codeMessageService } from '../services/codeMessageService';
import './DocumentationErrorMessagesModal.css';

interface ErrorMessage {
  code: string;
  message: string;
}

interface DocumentationErrorMessagesModalProps {
  errorMessages: ErrorMessage[];
  onSave: (messages: ErrorMessage[]) => void;
  onClose: () => void;
}

export const DocumentationErrorMessagesModal: React.FC<DocumentationErrorMessagesModalProps> = ({
  errorMessages,
  onSave,
  onClose,
}) => {
  const [messages, setMessages] = useState<ErrorMessage[]>(errorMessages);
  const [codeMessages, setCodeMessages] = useState<CodeMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCodeMessageId, setSelectedCodeMessageId] = useState('');

  useEffect(() => {
    const fetchCodeMessages = async () => {
      try {
        setLoading(true);
        const data = await codeMessageService.getAll();
        setCodeMessages(data);
      } catch (err) {
        console.error('Error al cargar mensajes de error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCodeMessages();
  }, []);

  const handleAddFromCodeMessage = () => {
    if (!selectedCodeMessageId) {
      alert('Selecciona un mensaje de error');
      return;
    }

    const selected = codeMessages.find(cm => cm.id === selectedCodeMessageId);
    if (!selected) return;

    const newError: ErrorMessage = {
      code: selected.httpCode,
      message: selected.response,
    };

    setMessages([...messages, newError]);
    setSelectedCodeMessageId('');
  };

  const handleDeleteMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(messages);
    onClose();
  };

  return (
    <>
      <div className="doc-error-modal__overlay" onClick={onClose} />
      <div className="doc-error-modal__slide">
        <div className="doc-error-modal__header">
          <h3 className="doc-error-modal__title">Mensajes</h3>
          <button
            type="button"
            className="doc-error-modal__close"
            onClick={onClose}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="doc-error-modal__content">
          <div className="doc-error-modal__section">
            <h4 className="doc-error-modal__subtitle">Seleccionar mensaje</h4>
            {loading ? (
              <p className="doc-error-modal__loading">Cargando mensajes...</p>
            ) : (
              <>
                <div className="doc-error-modal__input-group">
                  <select
                    value={selectedCodeMessageId}
                    onChange={(e) => setSelectedCodeMessageId(e.target.value)}
                    className="doc-error-modal__input"
                  >
                    <option value="">Seleccione</option>
                    {codeMessages.map(cm => (
                      <option key={cm.id} value={cm.id || ''}>
                        {cm.httpCode} - {cm.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddFromCodeMessage}
                  className="users-page__button"
                >
                  Agregar mensaje
                </button>
              </>
            )}
          </div>

          {messages.length > 0 && (
            <div className="doc-error-modal__section">
              <h4 className="doc-error-modal__subtitle">Mensajes agregados</h4>
              <div className="doc-error-modal__list">
                {messages.map((msg, index) => (
                  <div key={index} className="doc-error-modal__item">
                    <div>
                      <span className="doc-error-modal__code">{msg.code}</span>
                      <p className="doc-error-modal__message">{msg.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(index)}
                      className="doc-error-modal__btn-delete"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="doc-error-modal__footer">
          <button
            type="button"
            onClick={handleSave}
            className="users-page__button"
          >
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={onClose}
            className="users-page__button users-page__button--cancel"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
};
