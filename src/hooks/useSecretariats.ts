import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { secretariatsApi } from '@/api/endpoints';
import { getPaginated, unwrap } from '@/api/helpers';
import { QUERY_KEYS } from '@/utils/constants';
import type {
  CreateSecretariatPayload,
  GetSecretariatsParams,
  UpdateSecretariatPayload,
} from '@/types/secretariat';

export function useSecretariats(params: GetSecretariatsParams, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SECRETARIATS, params],
    queryFn: () => getPaginated(secretariatsApi.getAll(params)),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useSecretariat(id: number, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SECRETARIATS, id],
    queryFn: async () => unwrap(await secretariatsApi.getById(id)),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateSecretariat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSecretariatPayload) =>
      unwrap(await secretariatsApi.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SECRETARIATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
}

export function useUpdateSecretariat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateSecretariatPayload }) =>
      unwrap(await secretariatsApi.update(id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SECRETARIATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
}

export function useDeleteSecretariat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await secretariatsApi.remove(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SECRETARIATS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
    },
  });
}
