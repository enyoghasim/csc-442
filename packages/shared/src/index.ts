// Plain `as const` objects, not TS `enum` — enums compile to a runtime IIFE that Node's native
// TypeScript type-stripping (used to load this build-step-free package directly) can't handle,
// since it only erases types rather than transforming syntax. `UserRole.Lecturer` and the
// `UserRole` type both still work exactly as they would with a real enum.
export const UserRole = {
  Student: 'student',
  Lecturer: 'lecturer',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AttendanceStatus = {
  Present: 'present',
  Absent: 'absent',
  Late: 'late',
} as const;
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export interface AuthResponse {
  // TODO: define fields (will include the session id for mobile)
}

export interface SessionDTO {
  // TODO: define fields (class session, not auth session)
}

export interface AttendanceRecordDTO {
  // TODO: define fields
}

export interface ClassDTO {
  // TODO: define fields
}
