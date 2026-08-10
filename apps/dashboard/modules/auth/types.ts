// Re-exported from @attendance/shared rather than redefined here, so the shape can't drift from
// what the backend actually returns (mirrors apps/mobile's modules/auth/types.ts).
export type { PublicUser as User, UserRole, AuthResponse } from '@attendance/shared';
