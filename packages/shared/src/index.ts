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

// Matches apps/backend's response-factory.ts (success) and http-exception.filter.ts (error)
// envelope shape — NOT the reference project's shape (that one has `errors: ApiFieldError[]`,
// ours doesn't). Both apps' API clients unwrap responses against this same shape; keep it here
// instead of duplicating it per app.
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

// Mirrors apps/backend's PublicUser shape verbatim (common/utils/serialize-user.ts) — camelCase,
// allow-list (passwordHash never present). Dates are ISO strings over the wire, not Date objects.
export interface PublicUser {
  id: string;
  role: UserRole;
  name: string;
  email: string | null;
  regNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

// No session id in here, ever — it only ever exists in the httpOnly `Set-Cookie` header, never
// the response body (see apps/backend/AGENTS.md "Authentication & sessions").
export interface AuthResponse {
  user: PublicUser;
}

// Mirrors apps/backend's `classes` table (database/schema/classes.schema.ts).
export interface ClassDTO {
  id: string;
  name: string;
  code: string;
  lecturerId: string;
  createdAt: string;
  updatedAt: string;
}

// Named `ClassSessionDTO`, not `SessionDTO` — a scheduled meeting of a class, distinct from the
// backend's Redis-only auth "session" concept. Mirrors `database/schema/class-sessions.schema.ts`.
export interface ClassSessionDTO {
  id: string;
  classId: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
}

// Mirrors apps/backend's `attendance_records` table (database/schema/attendance-records.schema.ts).
export interface AttendanceRecordDTO {
  id: string;
  classSessionId: string;
  studentId: string;
  status: AttendanceStatus;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Response shape for the rotating QR check-in token (GET /api/sessions/:id/qr-token) — the token
// itself lives only in Redis (config/redis-keys.ts's qrTokenKey), never in Postgres.
export interface QrTokenResponse {
  classSessionId: string;
  token: string;
  expiresAt: string;
}
