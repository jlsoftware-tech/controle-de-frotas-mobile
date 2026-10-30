import { z } from 'zod';

const passwordField = z.string().min(8, 'A senha deve ter pelo menos 8 caracteres');

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255),
    email: z.string().trim().email('E-mail inválido').max(255),
    password: passwordField,
    password_confirmation: z.string(),
    profile_id: z.number().min(1, 'Selecione um perfil'),
    secretariat_id: z.number().min(1, 'Selecione uma secretaria'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não conferem',
    path: ['password_confirmation'],
  });

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255).optional(),
    email: z.string().trim().email('E-mail inválido').max(255).optional(),
    password: passwordField.optional().or(z.literal('')),
    password_confirmation: z.string().optional(),
    profile_id: z.number().min(1, 'Selecione um perfil').optional(),
    secretariat_id: z.number().min(1, 'Selecione uma secretaria').optional(),
  })
  .refine((data) => !data.password || data.password === data.password_confirmation, {
    message: 'As senhas não conferem',
    path: ['password_confirmation'],
  });

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
