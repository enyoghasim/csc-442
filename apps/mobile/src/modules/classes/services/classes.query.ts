import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/lib/api';
import type { ApiResponse } from '@attendance/shared';
import { handleApiError, validateApiResponse } from '../../shared/lib/util';
import { classesKeys } from '../../shared/services/query-keys';
import type { ClassDTO } from '../types';
import { CLASSES_ENDPOINTS } from './classes.endpoints';

// For a student (mobile is student-only), this is the set of classes they're enrolled in — see
// apps/backend's ClassesController.list (role-aware).
export const useClassesQuery = () => {
  return useQuery({
    queryKey: classesKeys.lists(),
    queryFn: async () => {
      try {
        const { data } = await api.get<ApiResponse<ClassDTO[]>>(CLASSES_ENDPOINTS.list);
        return validateApiResponse<ClassDTO[]>(data);
      } catch (error) {
        throw handleApiError(error);
      }
    },
  });
};
