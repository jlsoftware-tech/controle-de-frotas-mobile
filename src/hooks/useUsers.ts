import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/endpoints';
import { getPaginated, unwrap } from '@/api/helpers';
import { useAuthStore } from '@/store/authStore';
import { QUERY_KEYS } from '@/utils/constants';
import type {
  CreateUserPayload,
  GetUsersParams,
  UpdateUserPayload,
} from '@/types/user';

export function useUsers(params: GetUsersParams, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, params],
    queryFn: () => getPaginated(usersApi.getAll(params)),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useUser(id: number, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, id],
    queryFn: async () => unwrap(await usersApi.getById(id)),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserPayload) => unwrap(await usersApi.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserPayload }) =>
      unwrap(await usersApi.update(id, data)),
    onSuccess: async (updatedUser) => {
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.id === updatedUser.id) {
        await useAuthStore.getState().updateUser({
          name: updatedUser.name,
          email: updatedUser.email,
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await usersApi.remove(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
}
