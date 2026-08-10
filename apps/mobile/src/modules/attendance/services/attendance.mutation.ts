import { useMutation } from '@tanstack/react-query';
import { api } from '../../shared/lib/api';
import { ApiError, handleApiError, validateApiResponse } from '../../shared/lib/util';
import type { ApiResponse } from '@attendance/shared';
import { buildMutationOptions } from '../../shared/services/query-client';
import { attendanceKeys } from '../../shared/services/query-keys';
import { ATTENDANCE_ENDPOINTS } from './attendance.endpoints';

// The scanner's `{ classSessionId, token }` payload, parsed straight out of the scanned QR code's
// JSON per the dashboard/mobile QR payload contract — not a validated/typed DTO from
// @attendance/shared since it's just the check-in request body.
export interface CheckInValues {
  classSessionId: string;
  token: string;
}

// Invalidates attendanceKeys.all on success so the calendar refetches with the new record instead
// of trusting stale cached history — same shape as useLoginMutation/useLogoutMutation.
export const useCheckInMutation = () => {
  return useMutation<null, ApiError, CheckInValues>(
    buildMutationOptions(attendanceKeys.all, {
      mutationFn: async (values) => {
        try {
          const { data } = await api.post<ApiResponse<null>>(ATTENDANCE_ENDPOINTS.checkIn, values);
          return validateApiResponse<null>(data);
        } catch (error) {
          throw handleApiError(error);
        }
      },
    }),
  );
};
