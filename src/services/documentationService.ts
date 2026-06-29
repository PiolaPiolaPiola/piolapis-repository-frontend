import type { Documentation } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_DOCS_ENDPOINT = API_BASE_URL + '/v1/documentaciones';

export const documentationService = {
  async getAll(proyectoId?: string): Promise<Documentation[]> {
    const url = proyectoId ? `${API_DOCS_ENDPOINT}?proyectoId=${encodeURIComponent(proyectoId)}` : API_DOCS_ENDPOINT;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener documentaciones');
    return response.json();
  },

  async getById(id: string): Promise<Documentation> {
    const response = await fetch(`${API_DOCS_ENDPOINT}/${id}`);
    if (!response.ok) throw new Error(`Error al obtener documentación ${id}`);
    return response.json();
  },

  async create(payload: { name: string; description: string; code: string; type?: string | null; proyectoId: string; configuracionDocumentacionId: string; plantillaDtoId: string; version: string }): Promise<Documentation> {
    const response = await fetch(API_DOCS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al crear documentación');
    }
    return response.json();
  },

  async update(id: string, payload: { name: string; description: string; version: string; plantillaDtoId: string }): Promise<void> {
    const response = await fetch(`${API_DOCS_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al actualizar documentación');
    }
  },

  async changeStatus(id: string, isActive: boolean): Promise<void> {
    const response = await fetch(`${API_DOCS_ENDPOINT}/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    if (!response.ok) throw new Error('Error al cambiar estado');
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_DOCS_ENDPOINT}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al eliminar documentación');
  }
};
