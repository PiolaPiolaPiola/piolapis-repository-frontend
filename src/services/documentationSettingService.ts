import type { DocumentationSetting } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_SETTINGS_ENDPOINT = API_BASE_URL + '/v1/configuraciones-documentacion';

export const documentationSettingService = {
  async getAll(includeInactive: boolean = false): Promise<DocumentationSetting[]> {
    const response = await fetch(API_SETTINGS_ENDPOINT);
    if (!response.ok) throw new Error('Error al obtener configuraciones');
    const data = await response.json();
    return includeInactive ? data : data.filter((item: DocumentationSetting) => item.isActive);
  },

  async getById(id: string): Promise<DocumentationSetting> {
    const response = await fetch(`${API_SETTINGS_ENDPOINT}/${id}`);
    if (!response.ok) throw new Error(`Error al obtener configuración ${id}`);
    return response.json();
  },

  async create(payload: { name: string; description: string; code?: string; baseEndpoint: string; apiType: string; proyectoId: string }): Promise<DocumentationSetting> {
    const response = await fetch(API_SETTINGS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al crear configuración');
    }
    return response.json();
  },

  async update(id: string, payload: { name: string; description: string; baseEndpoint: string; apiType: string }): Promise<void> {
    const response = await fetch(`${API_SETTINGS_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al actualizar configuración');
    }
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_SETTINGS_ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar configuración');
  },

  async changeStatus(id: string, isActive: boolean): Promise<void> {
    const response = await fetch(`${API_SETTINGS_ENDPOINT}/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    if (!response.ok) throw new Error('Error al cambiar estado');
  }
};
