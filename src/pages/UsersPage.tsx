import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userManagementSchema } from '../utils/validations';
import type { UserManagementFormData } from '../utils/validations';
import type { User } from '../types';
import { Shield, Trash2, Edit, CheckCircle2, XCircle, UserPlus, RefreshCw, Eye } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/v1/usuarios';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [filterRole, setFilterRole] = useState<string>('');
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserManagementFormData>({
    resolver: zodResolver(userManagementSchema)
  });

  const fetchUsers = async (roleParam?: string) => {
    setLoading(true);
    setErrorApi(null);
    try {
      const url = roleParam ? `${API_URL}?rol=${roleParam}` : API_URL;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al obtener la lista de usuarios');
      const data: User[] = await response.json();
      
      if (data.length === 0) {
        setUsers([
          {
            id: 'a28aa2d9-6d74-4a65-a4a6-cf4bfa8777d6',
            username: 'admin_initial',
            name: 'Usuario',
            lastName: 'Prueba',
            description: 'Usuario administrador inicial del sistema de catálogo.',
            isActive: true,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
            role: 'Admin'
          }
        ]);
      } else {
        setUsers(data);
      }
    } catch (error) {
      setErrorApi('No se pudo conectar con el servidor externo. Cargando datos simulados.');
      setUsers([
        {
          id: 'a28aa2d9-6d74-4a65-a4a6-cf4bfa8777d6',
          username: 'admin_initial',
          name: 'Usuario (Local)',
          lastName: 'Prueba',
          description: 'Usuario administrador inicial del sistema de catálogo.',
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          role: 'Admin'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilterRole(value);
    fetchUsers(value);
  };

  const handleFetchById = async (id: string) => {
    setErrorApi(null);
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error();
      const data: User = await response.json();
      alert(`Detalle consultado:\nID: ${data.id}\nNombre Completo: ${data.name} ${data.lastName}\nRol asignado: ${data.role}`);
    } catch {
      setErrorApi('No se pudo recuperar la información del usuario desde el backend.');
    }
  };

  const onSubmit = async (data: UserManagementFormData) => {
    setErrorApi(null);
    try {
      if (isEditing && selectedUser?.id) {
        const updatedModel: User = {
          ...selectedUser,
          name: data.name,
          lastName: data.lastName,
          description: data.description,
          role: data.role,
          updatedDate: new Date().toISOString()
        };

        const response = await fetch(`${API_URL}/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedModel)
        });

        if (!response.ok) throw new Error();

        setUsers((prev) => prev.map((item) => item.id === selectedUser.id ? updatedModel : item));
        alert('Usuario actualizado de forma correcta');
      } else {
        const newModel: User = {
          id: null,
          username: data.username,
          password: data.password,
          name: data.name,
          lastName: data.lastName,
          description: data.description,
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          role: data.role
        };

        const response = await fetch(`${API_URL}/registro`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newModel)
        });

        if (!response.ok) throw new Error();

        const createdData: User = await response.json();
        setUsers((prev) => [...prev, createdData]);
        alert('Usuario registrado de forma correcta');
      }
      cancelEdit();
    } catch (error) {
      setErrorApi('Error en la operación del backend. Aplicando mutación local en memoria.');
      if (isEditing && selectedUser?.id) {
        setUsers((prev) => prev.map((item) => item.id === selectedUser.id ? { ...item, name: data.name, lastName: data.lastName, description: data.description, role: data.role, updatedDate: new Date().toISOString() } : item));
      } else {
        const localMock: User = {
          id: crypto.randomUUID(),
          username: data.username,
          name: data.name,
          lastName: data.lastName,
          description: data.description,
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          role: data.role
        };
        setUsers((prev) => [...prev, localMock]);
      }
      cancelEdit();
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setErrorApi(null);
    const patchedModel = {
      isActive: !currentStatus,
      updatedDate: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_URL}/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchedModel)
      });

      if (!response.ok) throw new Error();

      setUsers((prev) => prev.map((item) => item.id === id ? { ...item, isActive: !currentStatus, updatedDate: patchedModel.updatedDate } : item));
    } catch {
      setErrorApi('No se pudo aplicar el patch de estado en el servidor. Modificando localmente.');
      setUsers((prev) => prev.map((item) => item.id === id ? { ...item, isActive: !currentStatus, updatedDate: patchedModel.updatedDate } : item));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desea eliminar físicamente este registro de la base de datos?')) return;
    setErrorApi(null);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error();

      setUsers((prev) => prev.filter((item) => item.id !== id));
      alert('Registro eliminado del servidor');
    } catch {
      setErrorApi('El servidor denegó la baja física. Limpiando el registro de la vista local.');
      setUsers((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const startEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
    setValue('username', user.username || '');
    setValue('name', user.name);
    setValue('lastName', user.lastName);
    setValue('description', user.description);
    setValue('role', user.role);
  };

  const cancelEdit = () => {
    setSelectedUser(null);
    setIsEditing(false);
    reset();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Administración de Usuarios</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select value={filterRole} onChange={handleFilterChange} style={{ padding: '0.5rem', background: 'var(--color-container)', color: 'inherit', border: '1px solid var(--color-border)' }}>
            <option value="">Filtrar por Rol (Todos)</option>
            <option value="Admin">Admin</option>
            <option value="Operator">Operator</option>
          </select>
          <button onClick={() => fetchUsers(filterRole)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--color-border)' }}>
            <RefreshCw size={16} /> Recargar
          </button>
        </div>
      </div>

      {errorApi && <p style={{ color: 'var(--color-alert)', padding: '0.5rem', border: '1px solid var(--color-alert)', marginBottom: '1rem' }}>{errorApi}</p>}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: 'var(--color-container)', border: '1px solid var(--color-border)' }}>
        <h3>{isEditing ? 'Actualizar Información de Usuario' : 'Registrar Nuevo Integrante'}</h3>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <input {...register('username')} placeholder="Username" disabled={isEditing} style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'inherit', border: '1px solid var(--color-border)', opacity: isEditing ? 0.6 : 1 }} />
            {errors.username && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.username.message}</p>}
          </div>
          {!isEditing && (
            <div style={{ flex: 1 }}>
              <input {...register('password')} type="password" placeholder="Contraseña de acceso" style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'inherit', border: '1px solid var(--color-border)' }} />
              {errors.password && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.password.message}</p>}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <input {...register('name')} placeholder="Nombre" style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'inherit', border: '1px solid var(--color-border)' }} />
            {errors.name && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.name.message}</p>}
          </div>
          <div style={{ flex: 1 }}>
            <input {...register('lastName')} placeholder="Apellido" style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'inherit', border: '1px solid var(--color-border)' }} />
            {errors.lastName && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <input {...register('description')} placeholder="Descripción detallada de responsabilidades" style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'inherit', border: '1px solid var(--color-border)' }} />
          {errors.description && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.description.message}</p>}
        </div>

        <div>
          <select {...register('role')} style={{ width: '100%', padding: '0.5rem', background: 'var(--color-container)', color: 'inherit', border: '1px solid var(--color-border)' }}>
            <option value="">Seleccione un perfil de acceso</option>
            <option value="Admin">Admin</option>
            <option value="Operator">Operator</option>
          </select>
          {errors.role && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.role.message}</p>}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button type="submit" style={{ flex: 1, backgroundColor: 'var(--color-accent)', color: '#000000', padding: '0.6rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <UserPlus size={18} /> {isEditing ? 'Actualizar Credenciales' : 'Dar de Alta'}
          </button>
          {isEditing && (
            <button type="button" onClick={cancelEdit} style={{ flex: 1, border: '1px solid var(--color-border)', padding: '0.6rem' }}>
              Declinar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Procesando flujo de datos...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map((user) => (
            <div key={user.id || crypto.randomUUID()} style={{ padding: '1rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {user.name} {user.lastName}
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({user.username || 'sin-alias'})</span>
                </h4>
                <p style={{ fontSize: '0.85rem', margin: '0.25rem 0', opacity: 0.9 }}>{user.description}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Shield size={12} /> {user.role}
                  </span>
                  <span>Modificado: {new Date(user.updatedDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => user.id && handleFetchById(user.id)} title="Ver en Detalle">
                  <Eye size={20} />
                </button>
                <button onClick={() => user.id && handleToggleStatus(user.id, user.isActive)} title="Inmutar Estado Lógico">
                  {user.isActive ? <CheckCircle2 size={20} style={{ color: 'var(--color-accent)' }} /> : <XCircle size={20} style={{ color: 'var(--color-border)' }} />}
                </button>
                <button onClick={() => startEdit(user)} title="Editar Atributos">
                  <Edit size={20} />
                </button>
                <button onClick={() => user.id && handleDelete(user.id)} style={{ color: 'var(--color-alert)' }} title="Eliminación Física">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};