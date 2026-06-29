import type { Project } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_PROJECTS_ENDPOINT = `${API_BASE_URL}/Project`;

export const projectService = {
  async getAll(includeInactive = false): Promise<Project[]> {
    const response = await fetch(`${API_PROJECTS_ENDPOINT}?includeInactive=${includeInactive}`);
    if (!response.ok) throw new Error('Error al obtener proyectos');
    return response.json();
  },

  async getById(id: string): Promise<Project> {
    const response = await fetch(`${API_PROJECTS_ENDPOINT}/${id}`);
    if (!response.ok) throw new Error(`Error al obtener proyecto ${id}`);
    return response.json();
  },

  async create(payload: { name: string; description: string; code: string }): Promise<Project> {
    const response = await fetch(API_PROJECTS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al crear proyecto');
    }
    return response.json();
  },

  async update(id: string, payload: { name: string; description: string }): Promise<void> {
    const response = await fetch(`${API_PROJECTS_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al actualizar proyecto');
    }
  },

  async changeStatus(id: string, isActive: boolean): Promise<void> {
    const response = await fetch(`${API_PROJECTS_ENDPOINT}/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    if (!response.ok) throw new Error('Error al cambiar estado');
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_PROJECTS_ENDPOINT}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al eliminar proyecto');
  }
};
