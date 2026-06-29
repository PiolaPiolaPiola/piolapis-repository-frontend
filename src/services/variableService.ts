import type { Variable } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_VARS_ENDPOINT = `${API_BASE_URL}/v1/variables`;

export const variableService = {
  async getAll(includeInactive = false): Promise<Variable[]> {
    const response = await fetch(`${API_VARS_ENDPOINT}?includeInactive=${includeInactive}`);
    if (!response.ok) throw new Error('Error al obtener variables');
    return response.json();
  },

  async getById(id: string): Promise<Variable> {
    const response = await fetch(`${API_VARS_ENDPOINT}/${id}`);
    if (!response.ok) throw new Error(`Error al obtener variable ${id}`);
    return response.json();
  },

  async create(payload: { name: string; description: string; dataType: string; exampleValue?: string | null }): Promise<Variable> {
    const response = await fetch(API_VARS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al crear variable');
    }
    return response.json();
  },

  async update(id: string, payload: { description: string; dataType: string; exampleValue?: string | null }): Promise<void> {
    const response = await fetch(`${API_VARS_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al actualizar variable');
    }
  },

  async changeStatus(id: string, isActive: boolean): Promise<void> {
    const response = await fetch(`${API_VARS_ENDPOINT}/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    if (!response.ok) throw new Error('Error al cambiar estado');
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_VARS_ENDPOINT}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al eliminar variable');
  }
};
