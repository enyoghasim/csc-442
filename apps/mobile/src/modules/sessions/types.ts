// Re-exported from @attendance/shared rather than redefined here, so the shape can't drift from
// what the dashboard consumes or what apps/backend's class-sessions schema actually returns.
// Named `ClassSessionDTO` (not `SessionDTO`) — a scheduled meeting of a class, distinct from the
// backend's Redis-only auth "session" concept (see apps/backend/AGENTS.md).
export type { ClassSessionDTO } from '@attendance/shared';
