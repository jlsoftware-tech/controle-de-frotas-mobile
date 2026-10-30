import { z } from 'zod';

export const createSecretariatSchema = z.object({
  name: z.string().trim().min(3, 'Nome deve ter pelo menos 3 caracteres').max(255),
  acronym: z
    .string()
    .trim()
    .min(2, 'Sigla deve ter pelo menos 2 caracteres')
    .max(16, 'Sigla deve ter no máximo 16 caracteres'),
});

export const updateSecretariatSchema = createSecretariatSchema;

export type CreateSecretariatSchema = z.infer<typeof createSecretariatSchema>;
export type UpdateSecretariatSchema = z.infer<typeof updateSecretariatSchema>;
