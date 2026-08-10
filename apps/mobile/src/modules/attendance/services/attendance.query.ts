import { useQuery } from '@tanstack/react-query';
import { api } from '../../shared/lib/api';
import type { ApiResponse } from '@attendance/shared';
import { handleApiError, validateApiResponse } from '../../shared/lib/util';
import { attendanceKeys } from '../../shared/services/query-keys';
import type { DayAttendance } from '../types';
import { ATTENDANCE_ENDPOINTS } from './attendance.endpoints';

// One month of the student's check-in history at a time — the calendar screen calls this with
// whichever month is currently visible (via react-native-calendars' onMonthChange) and refetches
// as the student navigates months. The query key includes { month, year } so each month is
// cached/fetched independently, same pattern as a billboard-availability-style month endpoint.
export const useMyAttendanceQuery = (month: number, year: number) => {
  return useQuery({
    queryKey: attendanceKeys.list({ month, year }),
    queryFn: async () => {
      try {
        const { data } = await api.get<ApiResponse<DayAttendance[]>>(ATTENDANCE_ENDPOINTS.me, {
          params: { month, year },
        });
        return validateApiResponse<DayAttendance[]>(data);
      } catch (error) {
        throw handleApiError(error);
      }
    },
  });
};
