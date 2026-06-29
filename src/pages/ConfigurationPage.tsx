import React, { useState } from 'react';
import type { DocumentationSetting } from '../types';

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
    setSettings((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div>
      <h2>Configuraciones de Documentación</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px', marginBottom: '2rem' }}>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre de Configuración" required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción de Configuración" required />
        <input name="baseEndpoint" value={formData.baseEndpoint} onChange={handleChange} placeholder="Base Endpoint" required />
        
        <select name="apiType" value={formData.apiType} onChange={handleChange} required>
          <option value="">Tipo de API</option>
          <option value="R">REST</option>
          <option value="G">GraphQL</option>
        </select>
        
        <input name="proyectoId" value={formData.proyectoId} onChange={handleChange} placeholder="Proyecto ID (UUID)" required />

        <button type="submit">Guardar Configuración</button>
      </form>

      <h3>Lista de Configuraciones</h3>
      <ul>
        {settings.map((item) => (
          <li key={item.id || ''} style={{ marginBottom: '1rem', listStyle: 'none', border: '1px solid #ccc', padding: '1rem' }}>
            <strong>{item.name}</strong> ({item.apiType === 'R' ? 'REST' : 'GraphQL'})
            <p>{item.description}</p>
            <code>{item.baseEndpoint}</code>
            <br />
            <button onClick={() => handleDelete(item.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};