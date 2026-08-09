import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/lib/api';
import type { ApiResponse } from '../../shared/types/api';
import { userKeys } from '../../shared/services/query-keys';
import type { User } from '../types';
import { AUTH_ENDPOINTS } from './auth.endpoints';

// No local session-id check first — the httpOnly cookie isn't readable from app code either way,
// so whether there's a session is only knowable by asking the backend.
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
