import type { PaginatedData, PaginationParams, SortParams } from './api';

export interface Secretariat {
  id: number;
  name: string;
  acronym: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateSecretariatPayload {
  name: string;
  acronym: string;
}

export type UpdateSecretariatPayload = Partial<CreateSecretariatPayload>;

export interface GetSecretariatsParams extends PaginationParams, SortParams<'name' | 'acronym' | 'created_at'> {
  search?: string;
}

export type SecretariatsResponse = PaginatedData<Secretariat>;
