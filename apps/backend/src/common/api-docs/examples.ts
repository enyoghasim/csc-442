/** Swagger example of `toPublicUser()`'s shape — shared by every auth endpoint that returns a user. */
export const PUBLIC_USER_EXAMPLE = {
  id: '3d3f0b8e-2b7a-4a3a-9b1a-8e6f7c2d1a90',
  role: 'student',
  name: 'Jane Doe',
  email: null,
  regNumber: '2019/1/12345CS',
  createdAt: '2026-07-22T10:00:00.000Z',
  updatedAt: '2026-07-22T10:00:00.000Z',
};

/** Swagger example of a `classes` row — shared by every classes endpoint. */
export const CLASS_EXAMPLE = {
  id: '7c1e3a2d-9f4b-4c8a-8d1e-2b6f5a9c0e17',
  name: 'Software Engineering',
  code: 'CSC 422',
  lecturerId: '3d3f0b8e-2b7a-4a3a-9b1a-8e6f7c2d1a90',
  createdAt: '2026-07-22T10:00:00.000Z',
  updatedAt: '2026-07-22T10:00:00.000Z',
};

/** Swagger example of a `class_sessions` row — shared by every sessions endpoint. */
export const CLASS_SESSION_EXAMPLE = {
  id: '1f9a2b3c-4d5e-6f70-8192-a3b4c5d6e7f8',
  classId: '7c1e3a2d-9f4b-4c8a-8d1e-2b6f5a9c0e17',
  startsAt: '2026-08-12T09:00:00.000Z',
  endsAt: '2026-08-12T11:00:00.000Z',
  createdAt: '2026-07-22T10:00:00.000Z',
  updatedAt: '2026-07-22T10:00:00.000Z',
};

/** Swagger example of GET /api/sessions/:id/qr-token's response. */
export const QR_TOKEN_EXAMPLE = {
  classSessionId: '1f9a2b3c-4d5e-6f70-8192-a3b4c5d6e7f8',
  token: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
  expiresAt: '2026-08-12T09:01:30.000Z',
};

/** Swagger example of a student's attendance history row (GET /api/attendance/me). */
export const ATTENDANCE_HISTORY_EXAMPLE = {
  classSessionId: '1f9a2b3c-4d5e-6f70-8192-a3b4c5d6e7f8',
  classId: '7c1e3a2d-9f4b-4c8a-8d1e-2b6f5a9c0e17',
  startsAt: '2026-08-12T09:00:00.000Z',
  endsAt: '2026-08-12T11:00:00.000Z',
  status: 'present',
  checkedInAt: '2026-08-12T09:03:12.000Z',
};

/** Swagger example of one row of GET /api/attendance/sessions/:sessionId's roster response. */
export const SESSION_ROSTER_EXAMPLE = {
  studentId: '3d3f0b8e-2b7a-4a3a-9b1a-8e6f7c2d1a90',
  name: 'Jane Doe',
  regNumber: '2019/1/12345CS',
  status: 'present',
  checkedInAt: '2026-08-12T09:03:12.000Z',
};

/** Swagger example of one row of GET /api/attendance/classes/:classId/summary's response. */
export const CLASS_SUMMARY_EXAMPLE = {
  studentId: '3d3f0b8e-2b7a-4a3a-9b1a-8e6f7c2d1a90',
  name: 'Jane Doe',
  regNumber: '2019/1/12345CS',
  sessionsPresent: 8,
  totalSessions: 10,
  percentage: 80,
};
