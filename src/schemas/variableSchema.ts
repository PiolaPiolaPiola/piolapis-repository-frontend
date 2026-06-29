import { z } from 'zod';

const validDataTypes = ['String', 'Int', 'Bool'] as const;

export const variableSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre no puede exceder 100 caracteres.')
    .regex(/^[A-Za-z0-9._-]+$/, 'Solo se permiten letras, números, puntos, guiones y guiones bajos.'),

  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria.')
    .max(250, 'La descripción no puede exceder 250 caracteres.'),

  dataType: z.enum(validDataTypes, {
    message: 'Debe seleccionar un tipo de dato válido.',
  }),

  exampleValue: z
    .string()
    .trim()
    .max(250, 'El valor de ejemplo no puede exceder 250 caracteres.')
    .optional()
    .or(z.literal('')),
});

export type VariableFormData = z.infer<typeof variableSchema>;
