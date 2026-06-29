import { z } from 'zod';

const onlyLettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/;
const onlyLettersMessage = 'Solo se permiten letras y espacios.';

export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre no puede exceder 100 caracteres.')
    .regex(onlyLettersRegex, onlyLettersMessage), 
    
  lastName: z
    .string()
    .trim()
    .min(1, 'El apellido es obligatorio.')
    .max(100, 'El apellido no puede exceder 100 caracteres.')
    .regex(onlyLettersRegex, onlyLettersMessage), 
    
  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria.')
    .max(100, 'La descripción no puede exceder 100 caracteres.'),
    
  role: z
    .string()
    .min(1, 'Debe seleccionar un rol.'),
});

export type UserFormData = z.infer<typeof userSchema>;