import type { AttendanceStatus } from '@attendance/shared';
import type { ClassAttendanceMatrix, ClassAttendanceMatrixSession } from '../types';

// Below this percentage a student shows up in the "at risk" metric tile — a fixed threshold
// rather than a lecturer-configurable one, since there's no settings surface for it yet.
export const AT_RISK_THRESHOLD = 75;

export const statusLabels: Record<AttendanceStatus | 'absent', string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
};

export const statusBadgeVariant: Record<AttendanceStatus | 'absent', 'default' | 'secondary' | 'destructive'> = {
  present: 'default',
  late: 'secondary',
  absent: 'destructive',
};

export function sessionLabel(session: ClassAttendanceMatrixSession): string {
  return new Date(session.startsAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export interface SessionAttendanceRate {
  session: ClassAttendanceMatrixSession;
  rate: number;
}

export interface MatrixMetrics {
  sessionsHeld: number;
  averagePercentage: number;
  atRiskCount: number;
  bestSession: SessionAttendanceRate | null;
  worstSession: SessionAttendanceRate | null;
}

// Purely derived from the matrix already on screen — no separate metrics endpoint, since every
// number here is a reduction over data the matrix query already fetched.
export function computeMatrixMetrics(matrix: ClassAttendanceMatrix): MatrixMetrics {
  const now = Date.now();
  const heldSessions = matrix.sessions.filter((session) => new Date(session.endsAt).getTime() < now);

  const gradedRows = matrix.rows.filter((row) => row.totalSessions > 0);
  const averagePercentage = gradedRows.length
    ? Math.round((gradedRows.reduce((sum, row) => sum + row.percentage, 0) / gradedRows.length) * 10) / 10
    : 0;
  const atRiskCount = gradedRows.filter((row) => row.percentage < AT_RISK_THRESHOLD).length;

  let bestSession: SessionAttendanceRate | null = null;
  let worstSession: SessionAttendanceRate | null = null;

  if (matrix.rows.length) {
    for (const session of heldSessions) {
      const presentCount = matrix.rows.filter((row) => {
        const status = row.statuses[session.id];
        return status === 'present' || status === 'late';
      }).length;
      const rate = Math.round((presentCount / matrix.rows.length) * 1000) / 10;

      if (!bestSession || rate > bestSession.rate) bestSession = { session, rate };
      if (!worstSession || rate < worstSession.rate) worstSession = { session, rate };
    }
  }

  return { sessionsHeld: heldSessions.length, averagePercentage, atRiskCount, bestSession, worstSession };
}
