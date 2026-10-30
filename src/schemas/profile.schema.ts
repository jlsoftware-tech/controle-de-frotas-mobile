import { z } from 'zod';

export const createProfileSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255),
  description: z.string().max(255, 'Descrição deve ter no máximo 255 caracteres').optional(),
  permissions: z.array(z.number()),
});

export const updateProfileSchema = createProfileSchema;

export type CreateProfileSchema = z.infer<typeof createProfileSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
