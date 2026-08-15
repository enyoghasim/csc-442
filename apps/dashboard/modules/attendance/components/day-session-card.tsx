'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/modules/shared/lib/util';
import type { ClassSession } from '@/modules/sessions/types';
import { useSessionRosterQuery } from '../services/attendance.query';

// Self-contained: fetches its own roster count on mount rather than the day view fetching every
// visible session's roster up front, so picking a day only pays for the sessions actually shown.
export function DaySessionCard({ session, className }: { session: ClassSession; className: string }) {
  const { data: roster, isLoading } = useSessionRosterQuery(session.id);
  const presentCount = roster?.filter((entry) => entry.status === 'present' || entry.status === 'late').length ?? 0;

  return (
    <Link href={`/sessions/${session.id}`}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col">
            <span className="font-medium">{className}</span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(session.startsAt)} –{' '}
              {new Date(session.endsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
          <span className="shrink-0 text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : roster ? `${presentCount}/${roster.length} present` : '—'}
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
