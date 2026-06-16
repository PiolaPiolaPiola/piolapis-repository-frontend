import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '../utils/validations';
import type { ProjectFormData } from '../utils/validations';
import type { Project } from '../types';
import { Folder, Trash2, Edit2, Plus, RefreshCw, Eye } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/Project';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema)
  });

  const fetchProjects = async () => {
    setLoading(true);
    setErrorApi(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al obtener los proyectos');
      const data: Project[] = await response.json();
      
      if (data.length === 0) {
        setProjects([
          {
            id: 'c7a84d92-2cb1-4f51-b350-eb28d76de75e',
            name: 'Proyecto Core E-Commerce',
            description: 'Contenedor principal para las APIs de Checkout, Catálogo y Pagos.',
            isActive: true,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString()
          }
        ]);
      } else {
        setProjects(data);
      }
    } catch (error) {
      setErrorApi('No se pudo establecer comunicación con el backend. Cargando datos simulados.');
      setProjects([
        {
          id: 'c7a84d92-2cb1-4f51-b350-eb28d76de75e',
          name: 'Proyecto Core E-Commerce (Local)',
          description: 'Contenedor principal para las APIs de Checkout, Catálogo y Pagos.',
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleFetchById = async (id: string) => {
    setErrorApi(null);
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error();
      const data: Project = await response.json();
      alert(`Detalle del Proyecto:\nID: ${data.id}\nNombre: ${data.name}\nDescripción: ${data.description}`);
    } catch {
      setErrorApi('No se pudo recuperar el detalle específico del proyecto desde el servidor.');
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    setErrorApi(null);
    try {
      if (isEditing && selectedProject?.id) {
        const updatedModel: Project = {
          ...selectedProject,
          name: data.name,
          description: data.description,
          updatedDate: new Date().toISOString()
        };

        const response = await fetch(`${API_URL}/${selectedProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedModel)
        });

        if (!response.ok) throw new Error();

        setProjects((prev) => prev.map((item) => item.id === selectedProject.id ? updatedModel : item));
        alert('Proyecto actualizado correctamente');
      } else {
        const newModel: Project = {
          id: null,
          name: data.name,
          description: data.description,
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString()
        };

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newModel)
        });

        if (!response.ok) throw new Error();

        const createdData: Project = await response.json();
        setProjects((prev) => [...prev, createdData]);
        alert('Proyecto creado correctamente');
      }
      cancelEdit();
    } catch (error) {
      setErrorApi('Error al procesar la operación en el servidor. Aplicando cambios localmente.');
      if (isEditing && selectedProject?.id) {
        setProjects((prev) => prev.map((item) => item.id === selectedProject.id ? { ...item, name: data.name, description: data.description, updatedDate: new Date().toISOString() } : item));
      } else {
        const localMock: Project = {
          id: crypto.randomUUID(),
          name: data.name,
          description: data.description,
          isActive: true,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString()
        };
        setProjects((prev) => [...prev, localMock]);
      }
      cancelEdit();
    }
  };

  const handleSoftDelete = async (id: string) => {
    if (!confirm('¿Desea aplicar un borrado lógico a este proyecto?')) return;
    setErrorApi(null);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error();

      setProjects((prev) => prev.filter((item) => item.id !== id));
      alert('Proyecto marcado como eliminado del sistema');
    } catch {
      setErrorApi('El servidor no procesó el Soft Delete. Removiendo de la visualización del cliente.');
      setProjects((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const startEdit = (project: Project) => {
    setSelectedProject(project);
    setIsEditing(true);
    setValue('name', project.name);
    setValue('description', project.description);
  };

  const cancelEdit = () => {
    setSelectedProject(null);
    setIsEditing(false);
    reset();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Catálogo de Proyectos</h2>
        <button onClick={fetchProjects} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: '1px solid var(--color-border)' }}>
          <RefreshCw size={16} /> Sincronizar
        </button>
      </div>

      {errorApi && <p style={{ color: 'var(--color-alert)', padding: '0.5rem', border: '1px solid var(--color-alert)', marginBottom: '1rem' }}>{errorApi}</p>}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: 'var(--color-container)', border: '1px solid var(--color-border)' }}>
        <h3>{isEditing ? 'Editar Atributos del Proyecto' : 'Registrar Nuevo Proyecto'}</h3>
        
        <div>
          <input {...register('name')} placeholder="Nombre del Proyecto (Ej: Checkout API)" style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'inherit', border: '1px solid var(--color-border)' }} />
          {errors.name && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.name.message}</p>}
        </div>

        <div>
          <textarea {...register('description')} placeholder="Propósito del contenedor de documentación dentro del catálogo" style={{ width: '100%', padding: '0.5rem', background: 'transparent', color: 'inherit', border: '1px solid var(--color-border)', minHeight: '80px' }} />
          {errors.description && <p style={{ color: 'var(--color-alert)', fontSize: '0.85rem' }}>{errors.description.message}</p>}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" style={{ flex: 1, backgroundColor: 'var(--color-accent)', color: '#000000', padding: '0.6rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> {isEditing ? 'Confirmar Cambios' : 'Adicionar Proyecto'}
          </button>
          {isEditing && (
            <button type="button" onClick={cancelEdit} style={{ flex: 1, border: '1px solid var(--color-border)', padding: '0.6rem' }}>
              Descartar
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Consultando base de datos remota...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {projects.map((project) => (
            <div key={project.id || crypto.randomUUID()} style={{ padding: '1.25rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-container)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Folder size={20} style={{ color: 'var(--color-accent)' }} />
                  <h4 style={{ margin: 0 }}>{project.name}</h4>
                </div>
                <p style={{ fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.9 }}>{project.description}</p>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                  U: {new Date(project.updatedDate).toLocaleDateString()}
                </span>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => project.id && handleFetchById(project.id)} title="Ver en profundidad e incluir árbol de APIs">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => startEdit(project)} title="Modificar propiedades">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => project.id && handleSoftDelete(project.id)} style={{ color: 'var(--color-alert)' }} title="Aplicar Soft Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};