import type { User } from './user';

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
}

export interface UpdateInfoPayload {
  name?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  password: string;
  password_confirmation: string;
}
