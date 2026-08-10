import { useMutation } from '@tanstack/react-query';
import type { ApiResponse } from '@attendance/shared';
import { api } from '@/modules/shared/lib/api';
import { ApiError, handleApiError, validateApiResponse } from '@/modules/shared/lib/util';
import { buildMutationOptions } from '@/modules/shared/services/query-client';
import { sessionKeys } from '@/modules/shared/services/query-keys';
import type { ClassSession } from '../types';
import { SESSIONS_ENDPOINTS } from './sessions.endpoints';

// The wire shape apps/backend's ScheduleClassSessionRequest actually wants (ISO 8601 strings) —
// schedule-session-dialog.tsx composes this from its date+hour+minute dropdowns via
// validations/sessions.ts's combineDateTime() before calling this mutation, so this layer doesn't
// need to know anything about how the form collects the values.
export interface ScheduleSessionPayload {
  classId: string;
  startsAt: string;
  endsAt: string;
}

export const useScheduleSessionMutation = () => {
  return useMutation<ClassSession, ApiError, ScheduleSessionPayload>(
    buildMutationOptions(sessionKeys.lists(), {
      mutationFn: async (payload) => {
        try {
          const { data } = await api.post<ApiResponse<ClassSession>>(SESSIONS_ENDPOINTS.create, payload);
          return validateApiResponse<ClassSession>(data);
        } catch (error) {
          throw handleApiError(error);
        }
      },
    }),
  );
};
