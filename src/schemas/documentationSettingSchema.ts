import { z } from 'zod';

export const documentationSettingSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'El nombre no puede exceder 100 caracteres.'),
  description: z.string().trim().min(1, 'La descripción es obligatoria.').max(500, 'La descripción no puede exceder 500 caracteres.'),
  baseEndpoint: z.string().trim().min(1, 'El endpoint base es obligatorio.').url('El endpoint base debe ser una URL válida.'),
  apiType: z.enum(['R', 'G', 'S'], { errorMap: () => ({ message: 'El tipo de API debe ser REST, GraphQL o SOAP.' }) }),
  proyectoId: z.string().min(1, 'El proyecto es obligatorio.')
});
