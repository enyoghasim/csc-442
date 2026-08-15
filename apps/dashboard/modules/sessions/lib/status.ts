import type { ClassSession } from '../types';

// Shared by qr-display.tsx (poll gating), sessions-table.tsx (the active-only filter), and
// session-detail.tsx (whether to offer "End session") — one definition of "active" so they can't
// drift apart.
export function isSessionActive(session: Pick<ClassSession, 'startsAt' | 'endsAt'>): boolean {
  const now = Date.now();
  return now >= new Date(session.startsAt).getTime() && now <= new Date(session.endsAt).getTime();
}
