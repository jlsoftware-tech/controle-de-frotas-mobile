import { api } from './axios';
import type {
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  ResetPasswordPayload,
  UpdateInfoPayload,
} from '@/types/auth';
import type {
  CreateUserPayload,
  GetUsersParams,
  UpdateUserPayload,
  User,
  UsersResponse,
} from '@/types/user';
import type {
  CreateProfilePayload,
  GetProfilesParams,
  Permission,
  PermissionModule,
  Profile,
  ProfilesResponse,
  UpdateProfilePayload,
} from '@/types/profile';
import type {
  CreateSecretariatPayload,
  GetSecretariatsParams,
  Secretariat,
  SecretariatsResponse,
  UpdateSecretariatPayload,
} from '@/types/secretariat';
import type { ApiResponse, PaginatedData, PaginationParams } from '@/types/api';
import type {
  PermissionsCatalogResponse,
  SidebarItem,
  UserPermissions,
} from '@/types/permissions';

function cleanParams(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', {
      email: data.email,
      password: data.password,
      remember: data.remember,
    }),

  logout: () => api.get<ApiResponse<null>>('/auth/logout'),

  forgotPassword: (data: ForgotPasswordPayload) =>
    api.post<ApiResponse<null>>('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordPayload) =>
    api.post<ApiResponse<null>>('/auth/reset-password', data),
};

export const usersApi = {
  getAll: (params: GetUsersParams) =>
    api.get<ApiResponse<UsersResponse>>('/users', {
      params: cleanParams({
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        search: params.search,
        sort: params.sort,
        order: params.order,
      }),
    }),

  getById: (id: number) => api.get<ApiResponse<User>>(`/users/${id}`),

  create: (data: CreateUserPayload) => api.post<ApiResponse<User>>('/users', data),

  update: (id: number, data: UpdateUserPayload) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),

  remove: (id: number) => api.delete<ApiResponse<null>>(`/users/${id}`),

  getPermissions: (modules: PermissionModule[]) => {
    const query = modules
      .map((module) => `modules[]=${encodeURIComponent(module)}`)
      .join('&');
    return api.get<ApiResponse<UserPermissions>>(`/users/permissions${query ? `?${query}` : ''}`);
  },

  getSidebar: () => api.get<ApiResponse<SidebarItem[]>>('/users/sidebar'),

  updateOwnInfo: (data: UpdateInfoPayload) =>
    api.put<ApiResponse<User>>('/users/update', data),

  resetOwnPassword: (data: ChangePasswordPayload) =>
    api.put<ApiResponse<null>>('/users/reset-password', data),
};

export const profilesApi = {
  getAll: (params: GetProfilesParams) =>
    api.get<ApiResponse<ProfilesResponse>>('/profiles', {
      params: cleanParams({
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        search: params.search,
        sort: params.sort,
        order: params.order,
      }),
    }),

  getById: (id: number) => api.get<ApiResponse<Profile>>(`/profiles/${id}`),

  create: (data: CreateProfilePayload) =>
    api.post<ApiResponse<Profile>>('/profiles', data),

  update: (id: number, data: UpdateProfilePayload) =>
    api.put<ApiResponse<null>>(`/profiles/${id}`, data),

  remove: (id: number) => api.delete<ApiResponse<null>>(`/profiles/${id}`),
};

export const secretariatsApi = {
  getAll: (params: GetSecretariatsParams) =>
    api.get<ApiResponse<SecretariatsResponse>>('/secretariats', {
      params: cleanParams({
        page: params.page ?? 1,
        per_page: params.per_page ?? 10,
        search: params.search,
        sort: params.sort,
        order: params.order,
      }),
    }),

  getById: (id: number) => api.get<ApiResponse<Secretariat>>(`/secretariats/${id}`),

  create: (data: CreateSecretariatPayload) =>
    api.post<ApiResponse<Secretariat>>('/secretariats', data),

  update: (id: number, data: UpdateSecretariatPayload) =>
    api.put<ApiResponse<Secretariat>>(`/secretariats/${id}`, data),

  remove: (id: number) => api.delete<ApiResponse<null>>(`/secretariats/${id}`),
};

export const permissionsApi = {
  getAll: (params: PaginationParams = {}) =>
    api.get<ApiResponse<PermissionsCatalogResponse>>('/permissions', {
      params: cleanParams({
        page: params.page ?? 1,
        per_page: params.per_page ?? 100,
      }),
    }),

  getAllForProfile: async (): Promise<PaginatedData<Permission>> => {
    const response = await permissionsApi.getAll({ page: 1, per_page: 100 });
    return (
      response.data.data ?? {
        items: [],
        pagination: { numPerPage: 100, currPage: 1, totalEntries: 0, totalPages: 0 },
      }
    );
  },
};
