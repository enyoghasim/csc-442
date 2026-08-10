import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { ApiResponse } from '@attendance/shared';
import { api } from '@/modules/shared/lib/api';
import { ApiError, handleApiError, validateApiResponse } from '@/modules/shared/lib/util';
import { buildMutationOptions, queryClient } from '@/modules/shared/services/query-client';
import { userKeys } from '@/modules/shared/services/query-keys';
import { AUTH_ENDPOINTS } from './auth.endpoints';
import type { AuthResponse } from '../types';
import type { LoginValues } from '../validations/auth';

// Mirrors apps/mobile's modules/auth/services/auth.mutation.ts, swapping expo-router's global
// `router` for next/navigation's `useRouter` hook (called at the top of this custom hook, which
// is a valid hook-call site).
export const useLoginMutation = () => {
  const router = useRouter();

  return useMutation<AuthResponse, ApiError, LoginValues>({
    mutationFn: async (values) => {
      try {
        const { data } = await api.post<ApiResponse<AuthResponse>>(AUTH_ENDPOINTS.login, values);
        const authData = validateApiResponse<AuthResponse>(data);
        queryClient.setQueryData(userKeys.detail('me'), authData.user);
        router.replace('/classes');
        return authData;
      } catch (error) {
        throw handleApiError(error);
      }
    },
  });
};

export const useLogoutMutation = () => {
  const router = useRouter();

  return useMutation(
    buildMutationOptions(userKeys.all, {
      mutationFn: async () => {
        try {
          await api.post(AUTH_ENDPOINTS.logout);
        } catch {
          // Best-effort — the session cookie may already be gone/expired server-side.
        }
        queryClient.setQueryData(userKeys.detail('me'), null);
        router.replace('/login');
      },
    }),
  );
};
