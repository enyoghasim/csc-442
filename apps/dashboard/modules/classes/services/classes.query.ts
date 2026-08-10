import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@attendance/shared';
import { api } from '@/modules/shared/lib/api';
import { classKeys } from '@/modules/shared/services/query-keys';
import type { Class } from '../types';
import { CLASSES_ENDPOINTS } from './classes.endpoints';

// Lecturer-scoped list (the backend is role-aware: lecturers get classes they teach).
export const useClassesQuery = () => {
  return useQuery({
    queryKey: classKeys.lists(),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Class[]>>(CLASSES_ENDPOINTS.list);
      return data.data ?? [];
    },
  });
};
