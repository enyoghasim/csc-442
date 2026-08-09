import { QueryClient, QueryKey, UseMutationOptions } from '@tanstack/react-query';
import type { ApiError } from '../lib/util';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export interface QueryKeyFactory<TKey extends string> {
  all: readonly [TKey];
  lists: () => readonly [TKey, 'list'];
  list: (query: unknown) => readonly [TKey, 'list', unknown];
  details: () => readonly [TKey, 'detail'];
  detail: (id: string) => readonly [TKey, 'detail', string];
}

export function queryKeysFactory<TKey extends string>(key: TKey): QueryKeyFactory<TKey> {
  return {
    all: [key] as const,
    lists: () => [key, 'list'] as const,
    list: (query) => [key, 'list', query] as const,
    details: () => [key, 'detail'] as const,
    detail: (id) => [key, 'detail', id] as const,
  };
}

// Wraps a mutation's onSuccess to also invalidate a query key — e.g. logging in invalidates
// `userKeys.all` so useCurrentUserQuery refetches instead of the app trusting stale cached data.
export function buildMutationOptions<TData = unknown, TError = ApiError, TVariables = void, TContext = unknown>(
  queryKey?: QueryKey,
  options?: UseMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationOptions<TData, TError, TVariables, TContext> {
  return {
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await options?.onSuccess?.(data, variables, onMutateResult, context);
      if (!queryKey) return;
      await queryClient.invalidateQueries({ queryKey });
    },
  };
}
