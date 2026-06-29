import { z } from 'zod';

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre no puede exceder 100 caracteres.')
    .regex(/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ ._-]+$/, 'Solo se permiten letras, números, espacios, puntos, guiones y guiones bajos.'),

  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria.')
    .max(250, 'La descripción no puede exceder 250 caracteres.'),

  code: z
    .string()
    .trim()
    .min(1, 'El código es obligatorio.')
    .max(50, 'El código no puede exceder 50 caracteres.')
    .regex(/^[A-Za-z0-9._-]+$/, 'Solo se permiten letras, números, puntos, guiones y guiones bajos.'),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
