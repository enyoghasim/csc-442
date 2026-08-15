import { useQuery } from '@tanstack/react-query';
import type { ApiResponse } from '@attendance/shared';
import { api } from '@/modules/shared/lib/api';
import { attendanceKeys } from '@/modules/shared/services/query-keys';
import type { ClassAttendanceMatrix, SessionRosterEntry } from '../types';
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

// `sessionIds` in the query key (not just the URL) so picking a different session subset is a
// genuinely different cache entry, not a stale one reused across selections.
export const useClassMatrixQuery = (classId: string | undefined, sessionIds?: string[]) => {
  return useQuery({
    queryKey: [...attendanceKeys.detail(classId ?? ''), 'matrix', sessionIds ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ClassAttendanceMatrix>>(
        ATTENDANCE_ENDPOINTS.classMatrix(classId!, sessionIds),
      );
      return data.data ?? { sessions: [], rows: [] };
    },
    enabled: !!classId,
  });
};
