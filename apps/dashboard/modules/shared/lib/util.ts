import { AxiosError } from 'axios';
import type { ApiResponse } from '@attendance/shared';

// Ported 1:1 from apps/mobile's modules/shared/lib/util.ts — same backend, same error envelope,
// just adapted for axios-in-a-browser instead of axios-in-RN (no behavioral difference either
// way). `cn()` is NOT duplicated here — it already lives at dashboard's own `lib/utils.ts` and
// every shadcn-generated component imports it from `@/lib/utils` specifically.
export class ApiError extends Error {
  errors: string | string[];

  constructor(errors: string | string[]) {
    super(Array.isArray(errors) ? errors.join(', ') : errors);
    this.name = 'ApiError';
    this.errors = errors;
  }
}

// apps/backend's HttpExceptionFilter wraps every error as { success: false, error: { statusCode,
// message } }, but `message` itself is whatever `exception.getResponse()` returned — for a plain
// `UnauthorizedException('Invalid credentials')` that's the string, but for a class-validator
// ValidationPipe failure it's Nest's own `{ statusCode, message, error }` object with the real
// message(s) one level deeper. Handle both shapes.
export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { error?: { message?: unknown } } | undefined;
    const raw = data?.error?.message;

    if (Array.isArray(raw)) return new ApiError(raw as string[]);
    if (typeof raw === 'string') return new ApiError(raw);
    if (raw && typeof raw === 'object' && 'message' in raw) {
      const nested = (raw as { message: string | string[] }).message;
      return new ApiError(nested);
    }
    if (error.message) return new ApiError(error.message);
  }

  return new ApiError('Something went wrong. Please try again later.');
}

export function validateApiResponse<T>(response: ApiResponse<T>): T {
  if (!response || !response.success) {
    throw new Error(response?.message || 'An error occurred');
  }
  return response.data as T;
}
