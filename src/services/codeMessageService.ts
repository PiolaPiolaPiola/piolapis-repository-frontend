import type { CodeMessage } from '../types';

type CodeMessagePayload = {
  name: string;
  description: string;
  httpCode: string;
  response: string;
  responseType: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_CODES_ENDPOINT = `${API_BASE_URL}/v1/mensajes-codigos`;

export const codeMessageService = {
  async getAll(includeInactive = false): Promise<CodeMessage[]> {
    const response = await fetch(`${API_CODES_ENDPOINT}?includeInactive=${includeInactive}`);
    if (!response.ok) throw new Error('Error al obtener códigos');
    return response.json();
  },

  async getById(id: string): Promise<CodeMessage> {
    const response = await fetch(`${API_CODES_ENDPOINT}/${id}`);
    if (!response.ok) throw new Error(`Error al obtener código ${id}`);
    return response.json();
  },

  async create(payload: CodeMessagePayload): Promise<CodeMessage> {
    const response = await fetch(API_CODES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al crear código');
    }
    return response.json();
  },

  async update(id: string, payload: CodeMessagePayload): Promise<void> {
    const response = await fetch(`${API_CODES_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al actualizar código');
    }
  },

  async changeStatus(id: string, isActive: boolean): Promise<void> {
    const response = await fetch(`${API_CODES_ENDPOINT}/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    if (!response.ok) throw new Error('Error al cambiar estado');
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_CODES_ENDPOINT}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al eliminar código');
  }
};
