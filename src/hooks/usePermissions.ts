import { useQuery } from '@tanstack/react-query';
import { permissionsApi, usersApi } from '@/api/endpoints';
import { unwrap } from '@/api/helpers';
import { QUERY_KEYS } from '@/utils/constants';
import type { PermissionAction, PermissionModule } from '@/types/profile';
import type { UserPermissions } from '@/types/permissions';

const DEFAULT_MODULES: PermissionModule[] = ['users', 'profiles', 'secretariats'];

export function hasPermission(
  permissions: UserPermissions | undefined,
  module: string | null | undefined,
  action: PermissionAction = 'view',
): boolean {
  if (!module) return true;
  return Boolean(permissions?.[module]?.[action]);
}

export function useUserPermissions(modules: PermissionModule[] = DEFAULT_MODULES) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.USER_PERMISSIONS, modules],
    queryFn: async () => unwrap(await usersApi.getPermissions(modules)),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const can = (module: string | null | undefined, action: PermissionAction = 'view') =>
    hasPermission(query.data, module, action);

  return { ...query, can };
}

export function usePermissionsCatalog(enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PERMISSIONS, 'catalog'],
    queryFn: () => permissionsApi.getAllForProfile(),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSidebar() {
  return useQuery({
    queryKey: QUERY_KEYS.SIDEBAR,
    queryFn: async () => unwrap(await usersApi.getSidebar()),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
