import { isAxiosError, type AxiosResponse } from 'axios';
import type { ApiResponse, PaginatedData } from '@/types/api';
import { emptyPaginatedData } from '@/types/api';

export async function getPaginated<T>(
  request: Promise<AxiosResponse<ApiResponse<PaginatedData<T>>>>,
): Promise<PaginatedData<T>> {
  try {
    const response = await request;
    return response.data.data ?? emptyPaginatedData<T>();
  } catch (error) {
    // The API returns 400 with a friendly message when a list is empty.
    // For the app, an empty list is a valid state, not an error.
    if (isAxiosError(error) && error.response?.status === 400) {
      return emptyPaginatedData<T>();
    }
    throw error;
  }
}

export function unwrap<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (response.data.data == null) {
    throw new Error(response.data.message || 'Resposta inválida do servidor.');
  }
  return response.data.data;
}
