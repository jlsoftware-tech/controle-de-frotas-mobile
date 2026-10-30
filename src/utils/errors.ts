import { isAxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Extracts the most useful message from an API/network error so screens can
 * show something actionable instead of a generic failure.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = 'Não foi possível concluir a operação.',
): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;

    if (body?.errors) {
      const firstError = Object.values(body.errors).find(
        (messages) => Array.isArray(messages) && messages.length > 0,
      );
      if (firstError?.[0]) return firstError[0];
    }

    if (body?.message) return body.message;

    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
    }
  }

  if (error instanceof Error && error.message) return error.message;

  return fallback;
}
