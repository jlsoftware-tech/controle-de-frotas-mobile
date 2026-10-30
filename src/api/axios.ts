import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { API_URL, QUERY_KEYS } from '@/utils/constants';
import { queryClient } from './queryClient';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? '';
    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/reset-password');

    if (status === 401 && !isAuthRequest && useAuthStore.getState().token) {
      await useAuthStore.getState().clearSession();
      queryClient.clear();
      router.replace('/(auth)/login');
    }

    if (status === 403) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PERMISSIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SIDEBAR });
    }

    return Promise.reject(error);
  },
);
