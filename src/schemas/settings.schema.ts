import { z } from 'zod';

export const personalInfoSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(255),
  email: z.string().trim().email('E-mail inválido').max(255),
});

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não conferem',
    path: ['password_confirmation'],
  });

export type PersonalInfoSchema = z.infer<typeof personalInfoSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
