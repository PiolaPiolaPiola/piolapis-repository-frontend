import type { TemplateDto } from '../types';

type TemplateDtoPayload = {
  name: string;
  description: string;
  type: string;
  code?: string;
  requestType: string;
  request: string;
  response: string;
  responseType: string;
  tags?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TEMPLATE_DTOS_ENDPOINT = `${API_BASE_URL}/TemplateDTOs`;

export const templateDtoService = {
  async getAll(includeInactive = false): Promise<TemplateDto[]> {
    const response = await fetch(`${API_TEMPLATE_DTOS_ENDPOINT}?includeInactive=${includeInactive}`);
    if (!response.ok) throw new Error('Error al obtener plantillas DTO');
    return response.json();
  },

  async getById(id: string): Promise<TemplateDto> {
    const response = await fetch(`${API_TEMPLATE_DTOS_ENDPOINT}/${id}`);
    if (!response.ok) throw new Error(`Error al obtener plantilla DTO ${id}`);
    return response.json();
  },

  async create(payload: TemplateDtoPayload): Promise<TemplateDto> {
    const response = await fetch(API_TEMPLATE_DTOS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al crear plantilla DTO');
    }
    return response.json();
  },

  async update(id: string, payload: TemplateDtoPayload): Promise<void> {
    const response = await fetch(`${API_TEMPLATE_DTOS_ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Error al actualizar plantilla DTO');
    }
  },

  async changeStatus(id: string, isActive: boolean): Promise<void> {
    const response = await fetch(`${API_TEMPLATE_DTOS_ENDPOINT}/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    if (!response.ok) throw new Error('Error al cambiar estado');
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_TEMPLATE_DTOS_ENDPOINT}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al eliminar plantilla DTO');
  }
};
