import { z } from 'zod';

export const documentationSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  description: z
    .string()
    .min(1, 'La descripción es obligatoria')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  version: z
    .string()
    .min(1, 'La versión es obligatoria')
    .regex(/^\d+\.\d+\.\d+$/, 'La versión debe tener formato X.Y.Z (ej: 1.0.0)'),
  proyectoId: z
    .string()
    .min(1, 'Debe seleccionar un proyecto'),
  configuracionDocumentacionId: z
    .string()
    .min(1, 'Debe seleccionar una configuración de documentación'),
  requestDtoId: z
    .string()
    .optional()
    .nullable(),
  responseDtoId: z
    .string()
    .optional()
    .nullable(),
  endpointEspecifico: z
    .string()
    .min(1, 'El endpoint específico es obligatorio'),
  parametros: z
    .string()
    .optional()
    .nullable(),
  mensajesError: z
    .string()
    .optional()
    .nullable(),
  isPublica: z
    .boolean()
    .optional()
});

export type DocumentationFormData = z.infer<typeof documentationSchema>;
