import type { PaginatedData, PaginationParams, SortParams } from './api';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete';
export type PermissionModule = 'users' | 'profiles' | 'secretariats' | 'vehicles';

export interface Permission {
  id: number;
  action: PermissionAction | string;
  module: PermissionModule | string;
  created_at?: string;
  updated_at?: string;
  pivot?: {
    profile_id: number;
    permission_id: number;
  };
}

export interface Profile {
  id: number;
  name: string;
  description: string | null;
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateProfilePayload {
  name: string;
  description: string;
  permissions: number[];
}

export type UpdateProfilePayload = CreateProfilePayload;

export interface GetProfilesParams extends PaginationParams, SortParams<'name' | 'description' | 'created_at'> {
  search?: string;
}

export type ProfilesResponse = PaginatedData<Profile>;
