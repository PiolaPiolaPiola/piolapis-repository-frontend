import React, { useState } from 'react';
import type { DocumentationSetting } from '../types';
import './ConfigurationPage.css';

export const ConfigurationPage: React.FC = () => {
  const [settings, setSettings] = useState<DocumentationSetting[]>([
    {
      id: '1',
      name: 'Configuración Estándar Enterprise',
      description: 'Formato base para microservicios core',
      isActive: true,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      baseEndpoint: 'https://api.enterprise.com/v1',
      apiType: 'R',
      proyectoId: '00000000-0000-0000-0000-000000000000'
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseEndpoint: '',
    apiType: '',
    proyectoId: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!window.confirm('¿Deseas crear esta configuración?')) return;
    
    const newSetting: DocumentationSetting = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      isActive: true,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      baseEndpoint: formData.baseEndpoint,
      apiType: formData.apiType,
      proyectoId: formData.proyectoId
    };
    setSettings((prev) => [...prev, newSetting]);
    alert('Configuración creada exitosamente');
    setFormData({
      name: '',
      description: '',
      baseEndpoint: '',
      apiType: '',
      proyectoId: ''
    });
  };

  const handleDelete = (id: string | null) => {
    if (!id) return;
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta configuración?')) return;
    setSettings((prev) => prev.filter((s) => s.id !== id));
    alert('Configuración eliminada exitosamente');
  };

  return (
    <div className="configuration-page">
      <h2 className="users-page__title">Configuraciones de Documentación</h2>

      <form onSubmit={handleSubmit} className="users-page__form">
        <div className="users-page__field-group">
          <label className="users-page__label">Nombre</label>
          <input 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="Nombre de la configuración"
            className="users-page__input"
            required 
          />
        </div>

        <div className="users-page__field-group">
          <label className="users-page__label">Descripción</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Descripción de la configuración"
            className="users-page__input"
            required 
          />
        </div>

        <div className="users-page__field-group">
          <label className="users-page__label">Base Endpoint</label>
          <input 
            name="baseEndpoint" 
            value={formData.baseEndpoint} 
            onChange={handleChange} 
            placeholder="https://api.example.com/v1"
            className="users-page__input"
            required 
          />
        </div>
        
        <div className="users-page__field-group">
          <label className="users-page__label">Tipo de API</label>
          <select 
            name="apiType" 
            value={formData.apiType} 
            onChange={handleChange}
            className="users-page__select"
            required
          >
            <option value="">Selecciona un tipo</option>
            <option value="R">REST</option>
            <option value="G">GraphQL</option>
          </select>
        </div>
        
        <div className="users-page__field-group">
          <label className="users-page__label">Proyecto ID</label>
          <input 
            name="proyectoId" 
            value={formData.proyectoId} 
            onChange={handleChange} 
            placeholder="Ej: 00000000-0000-0000-0000-000000000000"
            className="users-page__input"
            required 
          />
        </div>

        <div className="users-page__actions">
          <button type="submit" className="users-page__button">Guardar Configuración</button>
        </div>
      </form>

      <h3 className="users-page__subtitle">Configuraciones existentes</h3>
      <div className="configuration-page__list">
        {settings.map((item) => (
          <div key={item.id || ''} style={{ marginBottom: '1rem', borderLeft: '4px solid var(--color-accent)', padding: '1rem', backgroundColor: 'var(--color-container)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-primary)' }}>{item.name}</h4>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>{item.description}</p>
                <code style={{ backgroundColor: 'var(--color-input-bg)', padding: '0.4rem 0.8rem', borderRadius: '4px', color: 'var(--color-accent)' }}>{item.baseEndpoint}</code>
                <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  ({item.apiType === 'R' ? 'REST' : 'GraphQL'})
                </span>
              </div>
              <button 
                onClick={() => handleDelete(item.id)}
                className="users-page__button"
                style={{ minWidth: 'auto', padding: '0.6rem 1rem', whiteSpace: 'nowrap' }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};