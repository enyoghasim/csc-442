import type { AttendanceStatus } from '@attendance/shared';

// These are report/read-model shapes, not raw entities — apps/backend's AttendanceService builds
// them by joining enrollments + attendance_records, they don't mirror a single table 1:1. Per
// packages/shared/AGENTS.md ("types/DTOs only" — but even so, only shapes shared across apps
// belong there, and these are dashboard-only), they're defined locally, same pattern as
// apps/mobile's modules/attendance/types.ts stub comment and apps/backend's own
// services/attendance/attendance.service.ts interfaces.

// GET /api/attendance/sessions/:sessionId — full roster, every enrolled student, 'absent' filled
// in for anyone with no record for that session.
export interface SessionRosterEntry {
  studentId: string;
  name: string;
  regNumber: string | null;
  status: AttendanceStatus;
  checkedInAt: string | null;
}

// GET /api/attendance/classes/:classId/matrix — student x session grid, optionally narrowed to a
// chosen subset of sessions via the `sessionIds` query param.
export interface ClassAttendanceMatrixSession {
  id: string;
  startsAt: string;
  endsAt: string;
}

export interface ClassAttendanceMatrixRow {
  studentId: string;
  name: string;
  regNumber: string | null;
  // Keyed by classSessionId. A session with no key here hasn't ended yet — not the same as
  // 'absent', which means it ended with no check-in record.
  statuses: Record<string, AttendanceStatus | 'absent'>;
  sessionsPresent: number;
  totalSessions: number;
  percentage: number;
}

export interface ClassAttendanceMatrix {
  sessions: ClassAttendanceMatrixSession[];
  rows: ClassAttendanceMatrixRow[];
}
