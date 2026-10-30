import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/endpoints';
import { unwrap } from '@/api/helpers';
import { useAuthStore } from '@/store/authStore';
import { QUERY_KEYS } from '@/utils/constants';
import type { ChangePasswordPayload, UpdateInfoPayload } from '@/types/auth';

export function useUpdateOwnInfo() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: async (data: UpdateInfoPayload) =>
      unwrap(await usersApi.updateOwnInfo(data)),
    onSuccess: async (user) => {
      await updateUser({ name: user.name, email: user.email });
      queryClient.setQueryData(QUERY_KEYS.AUTH, user);
    },
  });
}

export function useResetOwnPassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordPayload) => {
      const response = await usersApi.resetOwnPassword(data);
      return response.data.message;
    },
  });
}
