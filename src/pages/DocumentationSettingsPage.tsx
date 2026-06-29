import React, { useEffect, useState } from 'react';
import type { DocumentationSetting } from '../types';
import { documentationSettingService } from '../services/documentationSettingService';
import './UsersPage.css';

export const DocumentationSettingsPage: React.FC = () => {
  const [items, setItems] = useState<DocumentationSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', description: '', baseEndpoint: '', apiType: '', proyectoId: '' });

  useEffect(() => { fetchAll(); }, []);
  const fetchAll = async () => {
    try { setLoading(true); const data = await documentationSettingService.getAll(); setItems(data); } catch (err: any) { setError(err.message || 'Error'); } finally { setLoading(false); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
  const reset = () => { setForm({ name: '', description: '', baseEndpoint: '', apiType: '', proyectoId: '' }); setEditingId(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingId) {
        await documentationSettingService.update(editingId, { name: form.name, description: form.description, baseEndpoint: form.baseEndpoint, apiType: form.apiType });
        setItems(prev => prev.map(p => p.id === editingId ? { ...p, name: form.name, description: form.description, baseEndpoint: form.baseEndpoint, apiType: form.apiType } : p));
        reset();
        return;
      }
      const created = await documentationSettingService.create({ name: form.name, description: form.description, baseEndpoint: form.baseEndpoint, apiType: form.apiType, proyectoId: form.proyectoId });
      setItems(prev => [...prev, created]);
      reset();
    } catch (err: any) { setError(err.message || 'Error'); }
  };

  const handleDelete = async (id?: string | null) => { if (!id) return; if (!window.confirm('¿Eliminar configuración?')) return; try { await documentationSettingService.delete(id); setItems(prev => prev.filter(x => x.id !== id)); } catch (err: any) { setError(err.message || 'Error'); } };
  const handleEdit = (item: DocumentationSetting) => { if (!item.id) return; setForm({ name: item.name, description: item.description, baseEndpoint: item.baseEndpoint, apiType: item.apiType, proyectoId: item.proyectoId }); setEditingId(item.id); };

  return (
    <div>
      <h2 className="users-page__title">Configuraciones de Documentación</h2>
      {error && <div className="users-page__error"><strong>Error:</strong> {error}</div>}

      <form onSubmit={handleSubmit} className="users-page__form">
        <div>
          <label className="users-page__label">Nombre</label>
          <input name="name" value={form.name} onChange={handleChange} className="users-page__input" required />
        </div>
        <div>
          <label className="users-page__label">Descripción</label>
          <input name="description" value={form.description} onChange={handleChange} className="users-page__input" required />
        </div>
        <div>
          <label className="users-page__label">Base Endpoint</label>
          <input name="baseEndpoint" value={form.baseEndpoint} onChange={handleChange} className="users-page__input" />
        </div>
        <div>
          <label className="users-page__label">Api Type</label>
          <input name="apiType" value={form.apiType} onChange={handleChange} className="users-page__input" />
        </div>
        <div>
          <label className="users-page__label">ProyectoId</label>
          <input name="proyectoId" value={form.proyectoId} onChange={handleChange} className="users-page__input" />
        </div>

        <div className="users-page__actions">
          <button type="submit" className="users-page__button">{editingId ? 'Editar' : 'Registrar'}</button>
          {editingId && <button type="button" onClick={reset} className="users-page__button users-page__button--cancel">Cancelar edición</button>}
        </div>
      </form>

      <h3 className="users-page__subtitle">Configuraciones existentes</h3>
      {loading ? <p>Cargando...</p> : items.length === 0 ? <p>No se encontraron registros.</p> : (
        <ul className="users-page__list">
          {items.map(it => (
            <li key={it.id || ''} className="user-item">
              <div className="user-item__header">
                <div><strong>{it.name}</strong></div>
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
