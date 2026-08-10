import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@attendance/shared';
import { api } from '@/modules/shared/lib/api';
import { userKeys } from '@/modules/shared/services/query-keys';
import type { User } from '../types';
import { AUTH_ENDPOINTS } from './auth.endpoints';

// No local session check first — the httpOnly cookie isn't readable from app code either way, so
// whether there's a session is only knowable by asking the backend. Mirrors apps/mobile's
// modules/auth/services/auth.query.ts.
export const useCurrentUserQuery = () => {
  return useQuery({
    queryKey: userKeys.detail('me'),
    queryFn: async () => {
      try {
        const { data } = await api.get<ApiResponse<User>>(AUTH_ENDPOINTS.me);
        return data.data ?? null;
      } catch {
        return null;
      }
    },
    retry: false,
  });
};
