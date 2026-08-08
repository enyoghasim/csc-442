import { pgEnum } from 'drizzle-orm/pg-core';

// Canonical enums, defined once here and reused across tables — mirrors @attendance/shared's
// UserRole/AttendanceStatus TS enums. Do not let per-table duplicate/divergent versions creep in.
export const userRoleEnum = pgEnum('user_role', ['student', 'lecturer']);
export const attendanceStatusEnum = pgEnum('attendance_status', [
  'present',
  'absent',
  'late',
]);
