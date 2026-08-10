'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionRosterTable } from '@/modules/attendance/components/session-roster-table';
import { useSessionsQuery } from '../services/sessions.query';
import { QrDisplay } from './qr-display';

// The backend has no GET /api/sessions/:id (only list) — find the session client-side from the
// already-cached list query rather than adding a bespoke endpoint.
export function SessionDetail({ sessionId }: { sessionId: string }) {
  const { data: sessions, isLoading } = useSessionsQuery();
  const session = sessions?.find((s) => s.id === sessionId);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{session ? new Date(session.startsAt).toLocaleString() : 'Session'}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          {isLoading && <p className="text-sm text-muted-foreground">Loading session...</p>}
          {!isLoading && !session && <p className="text-sm text-destructive">Session not found.</p>}
          {session && <QrDisplay session={session} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionRosterTable sessionId={sessionId} />
        </CardContent>
      </Card>
    </div>
  );
}
