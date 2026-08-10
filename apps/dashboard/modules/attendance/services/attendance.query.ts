import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@attendance/shared';
import { api } from '@/modules/shared/lib/api';
import { attendanceKeys } from '@/modules/shared/services/query-keys';
import type { ClassAttendanceSummaryEntry, SessionRosterEntry } from '../types';
import { ATTENDANCE_ENDPOINTS } from './attendance.endpoints';

// Auto-refreshes so the roster reflects new check-ins while the lecturer has the live-QR page
// open, without requiring a manual reload.
export const useSessionRosterQuery = (sessionId: string, options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: [...attendanceKeys.detail(sessionId), 'roster'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<SessionRosterEntry[]>>(ATTENDANCE_ENDPOINTS.sessionRoster(sessionId));
      return data.data ?? [];
    },
    refetchInterval: options?.refetchInterval,
  });
};

export const useClassSummaryQuery = (classId: string | undefined) => {
  return useQuery({
    queryKey: [...attendanceKeys.detail(classId ?? ''), 'summary'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ClassAttendanceSummaryEntry[]>>(ATTENDANCE_ENDPOINTS.classSummary(classId!));
      return data.data ?? [];
    },
    enabled: !!classId,
  });
};
