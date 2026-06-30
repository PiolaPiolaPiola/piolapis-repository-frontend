import { z } from 'zod';

export const templateDtoSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'El nombre no puede exceder 100 caracteres.'),
  description: z.string().trim().min(1, 'La descripción es obligatoria.'),
  type: z.string().trim().min(1, 'El tipo de API es obligatorio.'),
  code: z.string().trim().max(100, 'El código no puede exceder 100 caracteres.').optional().or(z.literal('')),
  requestType: z.string().trim().min(1, 'El tipo de request es obligatorio.'),
  request: z.string().trim().min(1, 'La estructura del request es obligatoria.'),
  response: z.string().trim().min(1, 'La estructura del response es obligatoria.'),
  responseType: z.string().trim().min(1, 'El tipo de response es obligatorio.'),
  isShared: z.boolean(),
  tags: z.string().trim().max(500, 'Las etiquetas no pueden exceder 500 caracteres.').optional().or(z.literal('')),
});
