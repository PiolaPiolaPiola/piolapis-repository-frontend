import React, { useEffect, useState } from 'react';
import type { CodeMessage } from '../types';
import { codeMessageService } from '../services/codeMessageService';
import './UsersPage.css';

export const CodeMessagesPage: React.FC = () => {
  const [items, setItems] = useState<CodeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', description: '', code: '', type: '', httpCode: '', response: '', responseType: '' });

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => { try { setLoading(true); const data = await codeMessageService.getAll(); setItems(data); } catch (err: any) { setError(err.message || 'Error'); } finally { setLoading(false); } };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
  const reset = () => { setForm({ name: '', description: '', code: '', type: '', httpCode: '', response: '', responseType: '' }); setEditingId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingId) {
        await codeMessageService.update(editingId, { name: form.name, description: form.description, httpCode: form.httpCode, response: form.response, responseType: form.responseType });
        setItems(prev => prev.map(p => p.id === editingId ? { ...p, name: form.name, description: form.description, httpCode: form.httpCode, response: form.response, responseType: form.responseType } : p));
        reset();
        return;
      }
      const created = await codeMessageService.create({ name: form.name, description: form.description, code: form.code, type: form.type || null, httpCode: form.httpCode, response: form.response, responseType: form.responseType });
      setItems(prev => [...prev, created]);
      reset();
    } catch (err: any) { setError(err.message || 'Error'); }
  };

  const handleDelete = async (id?: string | null) => { if (!id) return; if (!window.confirm('¿Eliminar código?')) return; try { await codeMessageService.delete(id); setItems(prev => prev.filter(x => x.id !== id)); } catch (err: any) { setError(err.message || 'Error'); } };
  const handleEdit = (item: CodeMessage) => { if (!item.id) return; setForm({ name: item.name, description: item.description, code: item.code || '', type: item.type || '', httpCode: item.httpCode, response: item.response, responseType: item.responseType }); setEditingId(item.id); };

  return (
    <div>
      <h2 className="users-page__title">Mensajes / Códigos</h2>
      {error && <div className="users-page__error"><strong>Error:</strong> {error}</div>}

      <form onSubmit={handleSubmit} className="users-page__form">
        <div>
          <label className="users-page__label">Nombre</label>
          <input name="name" value={form.name} onChange={handleChange} className="users-page__input" required />
        </div>
        <div>
          <label className="users-page__label">Código</label>
          <input name="code" value={form.code} onChange={handleChange} className="users-page__input" required disabled={Boolean(editingId)} />
        </div>
        <div>
          <label className="users-page__label">Descripción</label>
          <input name="description" value={form.description} onChange={handleChange} className="users-page__input" required />
        </div>
        <div>
          <label className="users-page__label">Http Code</label>
          <input name="httpCode" value={form.httpCode} onChange={handleChange} className="users-page__input" />
        </div>
        <div>
          <label className="users-page__label">Response</label>
          <input name="response" value={form.response} onChange={handleChange} className="users-page__input" />
        </div>
        <div>
          <label className="users-page__label">Response Type</label>
          <input name="responseType" value={form.responseType} onChange={handleChange} className="users-page__input" />
        </div>

        <div className="users-page__actions">
          <button type="submit" className="users-page__button">{editingId ? 'Editar' : 'Registrar'}</button>
          {editingId && <button type="button" onClick={reset} className="users-page__button users-page__button--cancel">Cancelar edición</button>}
        </div>
      </form>

      <h3 className="users-page__subtitle">Códigos existentes</h3>
      {loading ? <p>Cargando...</p> : items.length === 0 ? <p>No se encontraron registros.</p> : (
        <ul className="users-page__list">
          {items.map(it => (
            <li key={it.id || ''} className="user-item">
              <div className="user-item__header">
                <div><strong>{it.name}</strong> <div className="user-item__role">{it.code}</div></div>
                <div className="user-item__actions">
                  <button className="user-item__button user-item__button--edit" onClick={() => handleEdit(it)}>Editar</button>
                  <button className="user-item__button user-item__button--delete" onClick={() => handleDelete(it.id)}>Eliminar</button>
                </div>
              </div>
              <p className="user-item__description">{it.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
