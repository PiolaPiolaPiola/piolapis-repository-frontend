import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { userService } from '../services/userService';
import { UserListItem } from '../components/UserListItem';
import { userSchema } from '../schemas/userSchema';
import './UsersPage.css';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [includeInactive, setIncludeInactive] = useState<boolean>(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    description: '',
    role: ''
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const isEditing = Boolean(editingUserId);

  useEffect(() => {
    fetchUsers();
  }, [includeInactive]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAll(undefined, includeInactive);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };

      const fieldSchema = userSchema.shape[name as keyof typeof userSchema.shape];

      if (fieldSchema) {
        const result = fieldSchema.safeParse(value);

        if (!result.success) {
          const issue = result.error.issues[0];
          setFieldErrors((prevErrors) => ({
            ...prevErrors,
            [name]: issue ? issue.message : 'Campo inválido',
          }));
        } else {
          setFieldErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors };
            delete updatedErrors[name];
            return updatedErrors;
          });
        }
      }

      return updatedForm;
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      lastName: '',
      description: '',
      role: ''
    });
    setEditingUserId(null);
    setFieldErrors({}); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0] as string] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    const validatedData = result.data;

    try {
      if (isEditing && editingUserId) {
        if (!window.confirm('¿Deseas actualizar este usuario?')) return;
        
        await userService.update(editingUserId, {
          name: validatedData.name,
          lastName: validatedData.lastName,
          description: validatedData.description
        });

        setUsers((prev) => prev.map((user) =>
          user.id === editingUserId
            ? { ...user, name: validatedData.name, lastName: validatedData.lastName, description: validatedData.description }
            : user
        ));

        alert('Usuario actualizado exitosamente');
        resetForm();
        return;
      }

      if (!window.confirm('¿Deseas crear este usuario?')) return;
      
      const createdUser = await userService.create(validatedData);

      setUsers((prev) => [...prev, createdUser]);
      alert('Usuario creado exitosamente');
      resetForm();
    } catch (err: any) {
      setError(err.message || (isEditing ? 'No se pudo actualizar el usuario.' : 'No se pudo guardar el usuario.'));
    }
  };

  const handleDelete = async (id: string | null) => {
    if (!id) return;
    if (!window.confirm('¿Está seguro de que desea eliminar este usuario?')) return;

    try {
      setError(null);
      await userService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      alert('Usuario eliminado exitosamente');
    } catch (err: any) {
      setError(err.message || 'No se pudo eliminar el usuario.');
    }
  };

  const handleEdit = (user: User) => {
    if (!user.id) return;

    setFormData({
      name: user.name,
      lastName: user.lastName,
      description: user.description,
      role: user.role
    });
    setEditingUserId(user.id);
    setError(null);
    setFieldErrors({});
  };

  const handleActivate = async (id: string | null, currentStatus: boolean | undefined) => {
    if (!id) return;
    const newStatus = !currentStatus;
    if (!window.confirm(`¿Deseas ${newStatus ? 'activar' : 'desactivar'} este usuario?`)) return;

    try {
      setError(null);
      
      const newStatus = !currentStatus; 
      
      await userService.patch(id, newStatus);

      setUsers((prevUsers) => {
        if (!newStatus && !includeInactive) {
          return prevUsers.filter((user) => user.id !== id);
        }
        
        return prevUsers.map((user) =>
          user.id === id ? { ...user, isActive: newStatus } : user
        );
      });
    } catch (err: any) {
      setError(err.message || 'No se pudo cambiar el estado del usuario.');
    }
  };

  return (
    <div>
      <h2 className="users-page__title">Administración de Usuarios</h2>

      {error && (
        <div className="users-page__error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="users-page__form" noValidate>
        <div className="users-page__field-group">        
          <label htmlFor="name" className="users-page__label">
            Nombre <span className="users-page__required">*</span>
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre"
            className={`users-page__input ${fieldErrors.name ? 'users-page__input--error' : ''}`}
          />
          {fieldErrors.name && <span className="users-page__feedback-error">{fieldErrors.name}</span>}
        </div>

        <div className="users-page__field-group">
          <label htmlFor="lastName" className="users-page__label">
            Apellido <span className="users-page__required">*</span>
          </label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Apellido"
            className={`users-page__input ${fieldErrors.lastName ? 'users-page__input--error' : ''}`}
          />
          {fieldErrors.lastName && <span className="users-page__feedback-error">{fieldErrors.lastName}</span>}
        </div>

        <div className="users-page__field-group">
          <label htmlFor="description" className="users-page__label">
            Descripción <span className="users-page__required">*</span>
          </label>
          <input
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción de funciones"
            className={`users-page__input ${fieldErrors.description ? 'users-page__input--error' : ''}`}
          />
          {fieldErrors.description && <span className="users-page__feedback-error">{fieldErrors.description}</span>}
        </div>

        <div className="users-page__field-group">
          <label htmlFor="role" className="users-page__label">
            Rol <span className="users-page__required">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isEditing}
            className={`users-page__select ${fieldErrors.role ? 'users-page__input--error' : ''}`}
          >
            <option value="">Seleccione Rol</option>
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Reader">Lector</option>
          </select>
          {fieldErrors.role && <span className="users-page__feedback-error">{fieldErrors.role}</span>}
        </div>

        <div className="users-page__actions">
          <button type="submit" className="users-page__button">
            {isEditing ? 'Editar' : 'Registrar'}
          </button>
          {isEditing && (
            <button type="button" onClick={resetForm} className="users-page__button users-page__button--cancel">
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div className="users-page__list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px 0' }}>
        <h3 className="users-page__subtitle" style={{ margin: 0 }}>Usuarios existentes</h3>
        
        <label className="users-page__checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="users-page__checkbox"
          />
          <span>Incluir inactivos</span>
        </label>
      </div>
      
      {loading ? (
        <p>Cargando...</p>
      ) : users.length === 0 ? (
        <p>No se encontraron registros.</p>
      ) : (
        <div className="users-page__list">
          {users.map((user) => (
            <UserListItem
              key={user.id || ''}
              user={user}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onActivate={handleActivate}
            />
          ))}
        </div>
      )}
    </div>
  );
};