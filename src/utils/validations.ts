import { z } from 'zod';

export const userManagementSchema = z.object({
  username: z.string().min(4, { message: 'El nombre de usuario debe tener al menos 4 caracteres' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }).optional().or(z.literal('')),
  name: z.string().min(2, { message: 'El nombre es obligatorio' }),
  lastName: z.string().min(2, { message: 'El apellido es obligatorio' }),
  description: z.string().min(5, { message: 'La descripción debe tener al menos 5 caracteres' }),
  role: z.string().min(1, { message: 'Debe seleccionar un rol' })
});

export type UserManagementFormData = z.infer<typeof userManagementSchema>;

export const documentationSettingSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  description: z.string().min(5, { message: 'La descripción debe tener al menos 5 caracteres' }),
  baseEndpoint: z.string().url({ message: 'Debe ser una URL válida' }),
  apiType: z.string().min(1, { message: 'Debe seleccionar un tipo de API' }),
  proyectoId: z.string().uuid({ message: 'Debe ser un identificador de proyecto válido' })
});

export type DocumentationSettingFormData = z.infer<typeof documentationSettingSchema>;

export const projectSchema = z.object({
  name: z.string().min(3, { message: 'El nombre del proyecto debe tener al menos 3 caracteres' }),
  description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres' })
});

export type ProjectFormData = z.infer<typeof projectSchema>;
