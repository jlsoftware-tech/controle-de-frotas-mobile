import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { authApi } from '@/api/endpoints';
import { useAuthStore } from '@/store/authStore';
import { QUERY_KEYS } from '@/utils/constants';
import type {
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
} from '@/types/auth';

export function useLogin() {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const response = await authApi.login(data);
      if (!response.data.data) {
        throw new Error(response.data.message || 'Resposta inválida do servidor.');
      }
      return response.data.data;
    },
    onSuccess: async (data, variables) => {
      await setSession(data.user, data.token, variables.remember);
      queryClient.setQueryData(QUERY_KEYS.AUTH, data.user);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PERMISSIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SIDEBAR });
      router.replace('/(app)');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: async () => {
      try {
        await authApi.logout();
      } catch {
        // A sessão local deve ser encerrada mesmo se o servidor estiver indisponível.
      }
    },
    onSettled: async () => {
      await clearSession();
      queryClient.clear();
      router.replace('/(auth)/login');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordPayload) => {
      const response = await authApi.forgotPassword(data);
      return response.data.message;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordPayload) => {
      const response = await authApi.resetPassword(data);
      return response.data.message;
    },
  });
}
