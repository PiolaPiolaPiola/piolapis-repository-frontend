import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_USERS_ENDPOINT = API_BASE_URL + '/User';
console.log(API_USERS_ENDPOINT);

export const userService = {
    async getAll(rol?: string, includeInactive?: boolean): Promise<User[]> {
        const params = new URLSearchParams();
        
        if (rol) {
            params.append('rol', rol);
        }
        
        if (includeInactive !== undefined) {
            params.append('includeInactive', String(includeInactive));
        }

        const queryString = params.toString();
        const url = queryString ? `${API_USERS_ENDPOINT}?${queryString}` : API_USERS_ENDPOINT;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al obtener los usuarios: ${response.statusText}`);
        }
        return response.json();
    },

    async getById(id: string): Promise<User> {
        const response = await fetch(`${API_USERS_ENDPOINT}/${id}`);
        if (!response.ok) {
            throw new Error(`Error al obtener el usuario con ID: ${id}`);
        }
        return response.json();
    },

    async create(userRequest: Omit<User, 'isActive'| 'id' | 'createdDate' | 'updatedDate' | 'username' | 'password' | 'code' | 'type' >): Promise<User> {
        const payload = {
            name: userRequest.name,
            lastName: userRequest.lastName,
            description: userRequest.description,
            role: userRequest.role
        };

        const response = await fetch(API_USERS_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al registrar el usuario.');
        }
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_USERS_ENDPOINT}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar el usuario.');
    },

    async update(id: string, userRequest: { name: string; lastName: string; description: string }): Promise<void> {
        const payload = {
            name: userRequest.name,
            lastName: userRequest.lastName,
            description: userRequest.description
        };

        const response = await fetch(`${API_USERS_ENDPOINT}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al actualizar el usuario.');
        }
        return;
    },

    async patch(id: string, status: boolean): Promise<void> {
        console.log(`status${status}`);
        const payload = {
            isActive: status
        };
        
        const response = await fetch(`${API_USERS_ENDPOINT}/${id}/status`, {
            method: "PATCH",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al actualizar el estado del usuario.');
        }
    }
};