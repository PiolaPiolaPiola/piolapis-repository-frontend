import { z } from 'zod';

export const codeMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre no puede exceder 100 caracteres.'),

  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria.')
    .max(250, 'La descripción no puede exceder 250 caracteres.'),

  httpCode: z
    .string()
    .trim()
    .min(1, 'El código HTTP es obligatorio.'),

  response: z
    .string()
    .trim()
    .min(1, 'La respuesta es obligatoria.'),

  responseType: z
    .string()
    .trim()
    .min(1, 'El tipo de respuesta es obligatorio.'),
});

export type CodeMessageFormData = z.infer<typeof codeMessageSchema>;
