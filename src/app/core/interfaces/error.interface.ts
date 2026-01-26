/**
 * Interface para erros da aplicação.
 * Tipagem genérica para tratamento de erros em catch blocks.
 */
export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Type guard para verificar se um erro é do tipo AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as AppError).message === 'string'
  );
}

/**
 * Extrai mensagem de erro de forma segura.
 * Útil para blocos catch onde o tipo do erro é unknown.
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Erro desconhecido';
}
