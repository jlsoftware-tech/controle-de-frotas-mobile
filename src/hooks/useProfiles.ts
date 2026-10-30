import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '@/api/endpoints';
import { getPaginated, unwrap } from '@/api/helpers';
import { QUERY_KEYS } from '@/utils/constants';
import type {
  CreateProfilePayload,
  GetProfilesParams,
  UpdateProfilePayload,
} from '@/types/profile';

export function useProfiles(params: GetProfilesParams, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROFILES, params],
    queryFn: () => getPaginated(profilesApi.getAll(params)),
    enabled,
    placeholderData: (previousData) => previousData,
  });
}

export function useProfile(id: number, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROFILES, id],
    queryFn: async () => unwrap(await profilesApi.getById(id)),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProfilePayload) =>
      unwrap(await profilesApi.create(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PERMISSIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SIDEBAR });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateProfilePayload }) => {
      // The API returns `data: null` on a successful profile update.
      await profilesApi.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PERMISSIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SIDEBAR });
    },
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await profilesApi.remove(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PERMISSIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SIDEBAR });
    },
  });
}
