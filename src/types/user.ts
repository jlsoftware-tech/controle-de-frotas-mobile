import type { PaginatedData, PaginationParams, SortParams } from './api';

export interface UserProfile {
  id: number;
  name: string;
}

export interface UserSecretariat {
  id: number;
  name: string;
  acronym: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile: UserProfile | null;
  secretariat: UserSecretariat | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  profile_id: number;
  secretariat_id: number;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  profile_id?: number;
  secretariat_id?: number;
}

export interface GetUsersParams extends PaginationParams, SortParams<'name' | 'email' | 'profile_id' | 'created_at'> {
  search?: string;
}

export type UsersResponse = PaginatedData<User>;
