// Re-exported from @attendance/shared rather than redefined here, so the shape can't drift from
// what the dashboard consumes or what apps/backend's serialize-user.ts actually returns.
export type { PublicUser as User, UserRole, AuthResponse } from '@attendance/shared';
