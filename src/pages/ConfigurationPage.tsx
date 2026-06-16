import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { documentationSettingSchema} from '../utils/validations';
import type { DocumentationSettingFormData} from '../utils/validations';
import type { DocumentationSetting } from '../types';
import { Trash2, Edit2, CheckCircle, XCircle, Plus, RefreshCw } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/v1/configuraciones-documentacion';

export const ConfigurationPage: React.FC = () => {
  const [settings, setSettings] = useState<DocumentationSetting[]>([]);
  const [selectedSetting, setSelectedSetting] = useState<DocumentationSetting | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DocumentationSettingFormData>({
    resolver: zodResolver(documentationSettingSchema)
  });

  const fetchSettings = async () => {
    setLoading(true);
    setErrorApi(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener las configuraciones');
      const data: DocumentationSetting[] = await response.json();
      
      if (data.length === 0) {
        setSettings([
          {
            id: 'd3b07384-d113-4ce4-a5ae-a56028f60a7e',
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
      } else {
        setSettings(data);
      }
    } catch (error) {
      setErrorApi('No se pudo conectar con el servidor. Cargando datos simulados.');
      setSettings([
        {
          id: 'd3b07384-d113-4ce4-a5ae-a56028f60a7e',
          name: 'Configuración Estándar Enterprise (Local)',
          description: 'Formato base para microservicios core',
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
          baseEndpoint: 'https://api.enterprise.com/v1',
          apiType: 'R',
          proyectoId: '00000000-0000-0000-0000-000000000000'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFetchById = async (id: string) => {
    setErrorApi(null);
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('No se encontró el registro');
      const data: DocumentationSetting = await response.json();
      alert(`Configuración cargada desde API: ${data.name}`);
    } catch {
      setErrorApi('Error al consultar el detalle en el servidor externo.');
    }
  };

  const onSubmit = async (data: DocumentationSettingFormData) => {
    setErrorApi(null);
    try {
      if (isEditing && selectedSetting?.id) {
        const updatedModel: DocumentationSetting = {
          ...selectedSetting,
          ...data,
          updatedDate: new Date().toISOString()
        };

        const response = await fetch(`${API_URL}/${selectedSetting.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedModel)
        });

        if (!response.ok) throw new Error('Error al actualizar en el servidor');

        setSettings((prev) => prev.map((item) => item.id === selectedSetting.id ? updatedModel : item));
        alert('Configuración actualizada con éxito');
      } else {
        const newModel: DocumentationSetting = {
          id: null,
          ...data,
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString()
        };

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newModel)
        });

        if (!response.ok) throw new Error('Error al crear en el servidor');

        const createdData: DocumentationSetting = await response.json();
        setSettings((prev) => [...prev, createdData]);
        alert('Configuración creada con éxito');
      }
      cancelEdit();
    } catch (error) {
      setErrorApi('Error en la operación del servidor. Aplicando cambios localmente en memoria.');
      if (isEditing && selectedSetting?.id) {
        setSettings((prev) => prev.map((item) => item.id === selectedSetting.id ? { ...item, ...data, updatedDate: new Date().toISOString() } : item));
      } else {
        const localMock: DocumentationSetting = {
          id: crypto.randomUUID(),
          ...data,
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString()
        };
        setSettings((prev) => [...prev, localMock]);
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
        method: 'HTMLPatch',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchedModel)
      });

      if (!response.ok) throw new Error();

      setSettings((prev) => prev.map((item) => item.id === id ? { ...item, isActive: !currentStatus, updatedDate: patchedModel.updatedDate } : item));
    } catch {
      setErrorApi('No se pudo actualizar el estado en el servidor. Modificando localmente.');
      setSettings((prev) => prev.map((item) => item.id === id ? { ...item, isActive: !currentStatus, updatedDate: patchedModel.updatedDate } : item));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta configuración físicamente?')) return;
    setErrorApi(null);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error();

      setSettings((prev) => prev.filter((item) => item.id !== id));
      alert('Registro eliminado');
    } catch {
      setErrorApi('No se pudo eliminar en el servidor. Removiendo de la vista local.');
      setSettings((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const startEdit = (setting: DocumentationSetting) => {
    setSelectedSetting(setting);
    setIsEditing(true);
    setValue('name', setting.name);
    setValue('description', setting.description);
    setValue('baseEndpoint', setting.baseEndpoint);
    setValue('apiType', setting.apiType);
    setValue('proyectoId', setting.proyectoId);
  };

  const cancelEdit = () => {
    setSelectedSetting(null);
    setIsEditing(false);
    reset();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Configuraciones de Documentación</h2>
        <button onClick={fetchSettings} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--color-border)' }}>
          <RefreshCw size={16} /> Refrescar
        </button>
      </div>

      {errorApi && <p style={{ color: 'var(--color-alert)', padding: '0.5rem', border: '1px solid var(--color-alert)', marginBottom: '1rem' }}>{errorApi}</p>}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: 'var(--color-container)', border: '1px solid var(--color-border)' }}>
        <h3>{isEditing ? 'Modificar Configuración' : 'Nueva Configuración base'}</h3>
        
        <div>
          <input {...register('name')} placeholder="Nombre de la configuración (Ej: Enterprise Standard)" style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'inherit', border: '1px solid var(--color-border)' }} />
          {errors.name && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.name.message}</p>}
        </div>

        <div>
          <textarea {...register('description')} placeholder="Descripción de las reglas o alcances" style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'inherit', border: '1px solid var(--color-border)', minHeight: '80px' }} />
          {errors.description && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.description.message}</p>}
        </div>

        <div>
          <input {...register('baseEndpoint')} placeholder="Base Endpoint (URL)" style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'inherit', border: '1px solid var(--color-border)' }} />
          {errors.baseEndpoint && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.baseEndpoint.message}</p>}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <select {...register('apiType')} style={{ width: '100%', padding: '0.5rem', background: 'var(--color-container)', color: 'inherit', border: '1px solid var(--color-border)' }}>
              <option value="">Tipo de API</option>
              <option value="R">REST</option>
              <option value="G">GraphQL</option>
            </select>
            {errors.apiType && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.apiType.message}</p>}
          </div>

          <div style={{ flex: 1 }}>
            <input {...register('proyectoId')} placeholder="Proyecto ID (UUID)" style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'inherit', border: '1px solid var(--color-border)' }} />
            {errors.proyectoId && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.proyectoId.message}</p>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button type="submit" style={{ flex: 1, backgroundColor: 'var(--color-accent)', color: '#000000', padding: '0.6rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> {isEditing ? 'Actualizar' : 'Guardar'}
          </button>
          {isEditing && (
            <button type="button" onClick={cancelEdit} style={{ flex: 1, border: '1px solid var(--color-border)', padding: '0.6rem' }}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Procesando peticiones...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {settings.map((item) => (
            <div key={item.id || crypto.randomUUID()} style={{ padding: '1rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {item.name}
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '10px', backgroundColor: item.isActive ? 'var(--color-accent)' : 'var(--color-border)', color: '#000000' }}>
                    {item.apiType === 'R' ? 'REST' : 'GraphQL'}
                  </span>
                </h4>
                <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>{item.description}</p>
                <code style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{item.baseEndpoint}</code>
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>
                  Modificado: {new Date(item.updatedDate).toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => item.id && handleFetchById(item.id)} style={{ padding: '0.3rem', border: '1px solid var(--color-border)', fontSize: '0.75rem' }}>
                  Verificar API
                </button>
                <button onClick={() => item.id && handleToggleStatus(item.id, item.isActive)} title="Cambiar Estado">
                  {item.isActive ? <CheckCircle size={20} style={{ color: 'var(--color-accent)' }} /> : <XCircle size={20} style={{ color: 'var(--color-border)' }} />}
                </button>
                <button onClick={() => startEdit(item)} title="Editar">
                  <Edit2 size={20} />
                </button>
                <button onClick={() => item.id && handleDelete(item.id)} style={{ color: 'var(--color-alert)' }} title="Eliminar">
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