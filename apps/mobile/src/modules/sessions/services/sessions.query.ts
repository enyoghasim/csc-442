import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/lib/api';
import type { ApiResponse } from '@attendance/shared';
import { handleApiError, validateApiResponse } from '../../shared/lib/util';
import { sessionsKeys } from '../../shared/services/query-keys';
import type { ClassSessionDTO } from '../types';
import { SESSIONS_ENDPOINTS } from './sessions.endpoints';

// For a student (mobile is student-only), this is every scheduled session of a class they're
// enrolled in — see apps/backend's SessionsController.list (role-aware). The Home tab filters
// this client-side down to "today".
export const useSessionsQuery = () => {
  return useQuery({
    queryKey: sessionsKeys.lists(),
    queryFn: async () => {
      try {
        const { data } = await api.get<ApiResponse<ClassSessionDTO[]>>(SESSIONS_ENDPOINTS.list);
        return validateApiResponse<ClassSessionDTO[]>(data);
      } catch (error) {
        throw handleApiError(error);
      }
    },
  });
};
