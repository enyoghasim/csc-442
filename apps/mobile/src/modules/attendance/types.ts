import type { AttendanceStatus } from '@attendance/shared';

// GET /api/attendance/me's response shape — a read-model (the student's attendance record
// already joined with its session's start/end + class id), not a raw entity, so it doesn't live
// alongside AttendanceRecordDTO in @attendance/shared. Mirrors apps/backend's
// AttendanceHistoryRow (repositories/attendance-records/attendance-records.repository.ts) —
// dates are ISO strings over the wire, not Date objects.
export interface AttendanceHistoryRecord {
  classSessionId: string;
  classId: string;
  startsAt: string;
  endsAt: string;
  status: AttendanceStatus;
  checkedInAt: string | null;
}

// One entry per calendar day of the requested month — dense, every day, not just days with a
// session, so the calendar screen can index straight by date. Mirrors apps/backend's
// DayAttendance (services/attendance/attendance.service.ts).
export interface DayAttendance {
  date: string; // 'yyyy-MM-dd', UTC
  records: AttendanceHistoryRecord[];
}
