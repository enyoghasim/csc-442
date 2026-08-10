export const ATTENDANCE_ENDPOINTS = {
  sessionRoster: (sessionId: string) => `/api/attendance/sessions/${sessionId}`,
  classSummary: (classId: string) => `/api/attendance/classes/${classId}/summary`,
  // Not fetched via axios — a plain top-level <a href> download, GET+SameSite=Lax cookie works
  // fine for that (see modules/attendance/components/export-summary-link.tsx).
  classSummaryExport: (classId: string) => `/api/attendance/classes/${classId}/summary/export`,
} as const;
