import { useMutation } from '@tanstack/react-query';
import type { ApiResponse } from '@attendance/shared';
import { api } from '@/modules/shared/lib/api';
import { ApiError, handleApiError, validateApiResponse } from '@/modules/shared/lib/util';
import { buildMutationOptions } from '@/modules/shared/services/query-client';
import { classKeys } from '@/modules/shared/services/query-keys';
import type { Class } from '../types';
import type { CreateClassValues, EnrollStudentValues } from '../validations/classes';
import { CLASSES_ENDPOINTS } from './classes.endpoints';

// Create is lecturer-only server-side; the backend returns a clean 409 on a duplicate `code`,
// unwrapped into ApiError by handleApiError same as every other mutation in this app.
export const useCreateClassMutation = () => {
  return useMutation<Class, ApiError, CreateClassValues>(
    buildMutationOptions(classKeys.lists(), {
      mutationFn: async (values) => {
        try {
          const { data } = await api.post<ApiResponse<Class>>(CLASSES_ENDPOINTS.create, values);
          return validateApiResponse<Class>(data);
        } catch (error) {
          throw handleApiError(error);
        }
      },
    }),
  );
};

export const useEnrollStudentMutation = (classId: string) => {
  return useMutation<null, ApiError, EnrollStudentValues>({
    mutationFn: async (values) => {
      try {
        const { data } = await api.post<ApiResponse<null>>(CLASSES_ENDPOINTS.enroll(classId), values);
        return validateApiResponse<null>(data);
      } catch (error) {
        throw handleApiError(error);
      }
    },
  });
};
