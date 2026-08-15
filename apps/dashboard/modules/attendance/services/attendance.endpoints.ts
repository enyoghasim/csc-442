// Builds the "?sessionIds=a,b,c" suffix shared by the matrix endpoints below — omitted entirely
// (not sent as an empty param) when no subset is chosen, so the backend's `IsOptional` sees it as
// unset rather than an empty-string array.
function matrixQuery(sessionIds?: string[]): string {
  return sessionIds?.length ? `?sessionIds=${sessionIds.join(',')}` : '';
}

export const ATTENDANCE_ENDPOINTS = {
  sessionRoster: (sessionId: string) => `/api/attendance/sessions/${sessionId}`,
  // Not fetched via axios — a plain top-level <a href> download, GET+SameSite=Lax cookie works
  // fine for that (see modules/attendance/components/export-matrix-dropdown.tsx).
  classMatrix: (classId: string, sessionIds?: string[]) =>
    `/api/attendance/classes/${classId}/matrix${matrixQuery(sessionIds)}`,
  classMatrixExport: (classId: string, sessionIds?: string[]) =>
    `/api/attendance/classes/${classId}/matrix/export${matrixQuery(sessionIds)}`,
} as const;
