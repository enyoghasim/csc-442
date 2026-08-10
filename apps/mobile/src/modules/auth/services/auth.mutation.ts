import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { api } from '../../shared/lib/api';
import { ApiError, handleApiError, validateApiResponse } from '../../shared/lib/util';
import type { ApiResponse } from '@attendance/shared';
import { buildMutationOptions, queryClient } from '../../shared/services/query-client';
import { userKeys } from '../../shared/services/query-keys';
import { AUTH_ENDPOINTS } from './auth.endpoints';
import type { AuthResponse } from '../types';
import type { LoginValues } from '../validations/auth';

export const useLoginMutation = () => {
  return useMutation<AuthResponse, ApiError, LoginValues>({
    mutationFn: async (values) => {
      try {
        const { data } = await api.post<ApiResponse<AuthResponse>>(AUTH_ENDPOINTS.login, values);
        const authData = validateApiResponse<AuthResponse>(data);
        queryClient.setQueryData(userKeys.detail('me'), authData.user);
        router.replace('/(app)/(tabs)');
        return authData;
      } catch (error) {
        throw handleApiError(error);
      }
    },
  });
};

export const useLogoutMutation = () => {
  return useMutation(
    buildMutationOptions(userKeys.all, {
      mutationFn: async () => {
        try {
          await api.post(AUTH_ENDPOINTS.logout);
        } catch {
          // Best-effort — the session cookie may already be gone/expired server-side.
        }
        router.replace('/');
      },
    }),
  );
};
