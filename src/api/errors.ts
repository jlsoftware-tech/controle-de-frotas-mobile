import { isAxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export function getApiErrorMessage(error: unknown, fallback = 'Não foi possível concluir a operação.'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (data?.message) return data.message;

    const firstFieldError = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    if (firstFieldError) return firstFieldError;

    if (error.code === 'ECONNABORTED') {
      return 'O servidor demorou para responder. Tente novamente.';
    }

    if (!error.response) {
      return 'Não foi possível conectar ao servidor. Verifique a rede e a URL da API.';
    }
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function getApiFieldErrors(error: unknown): Record<string, string> {
  if (!isAxiosError(error)) return {};

  const data = error.response?.data as ApiErrorBody | undefined;
  if (!data?.errors) return {};

  return Object.fromEntries(
    Object.entries(data.errors).map(([field, messages]) => [field, messages[0] ?? 'Valor inválido.']),
  );
}
