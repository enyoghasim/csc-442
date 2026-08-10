import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/lib/api';
import type { ApiResponse } from '@attendance/shared';
import { handleApiError, validateApiResponse } from '../../shared/lib/util';
import { attendanceKeys } from '../../shared/services/query-keys';
import type { AttendanceHistoryRecord } from '../types';
import { ATTENDANCE_ENDPOINTS } from './attendance.endpoints';

// The student's full check-in history, used to build the calendar's markedDates.
export const useMyAttendanceQuery = () => {
  return useQuery({
    queryKey: attendanceKeys.list('me'),
    queryFn: async () => {
      try {
        const { data } = await api.get<ApiResponse<AttendanceHistoryRecord[]>>(ATTENDANCE_ENDPOINTS.me);
        return validateApiResponse<AttendanceHistoryRecord[]>(data);
      } catch (error) {
        throw handleApiError(error);
      }
    },
  });
};
