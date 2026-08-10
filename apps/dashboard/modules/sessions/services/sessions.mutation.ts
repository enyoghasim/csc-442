import { useMutation } from '@tanstack/react-query';
import type { ApiResponse } from '@attendance/shared';
import { api } from '@/modules/shared/lib/api';
import { ApiError, handleApiError, validateApiResponse } from '@/modules/shared/lib/util';
import { buildMutationOptions } from '@/modules/shared/services/query-client';
import { sessionKeys } from '@/modules/shared/services/query-keys';
import type { ClassSession } from '../types';
import type { ScheduleSessionValues } from '../validations/sessions';
import { SESSIONS_ENDPOINTS } from './sessions.endpoints';

export const useScheduleSessionMutation = () => {
  return useMutation<ClassSession, ApiError, ScheduleSessionValues>(
    buildMutationOptions(sessionKeys.lists(), {
      mutationFn: async (values) => {
        try {
          // Local-time datetime-local strings -> ISO 8601, matching apps/backend's
          // ScheduleClassSessionRequest (`@IsISO8601()`).
          const payload = {
            classId: values.classId,
            startsAt: new Date(values.startsAt).toISOString(),
            endsAt: new Date(values.endsAt).toISOString(),
          };
          const { data } = await api.post<ApiResponse<ClassSession>>(SESSIONS_ENDPOINTS.create, payload);
          return validateApiResponse<ClassSession>(data);
        } catch (error) {
          throw handleApiError(error);
        }
      },
    }),
  );
};
