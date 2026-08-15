'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClassesQuery } from '@/modules/classes/services/classes.query';
import { formatDateTime } from '@/modules/shared/lib/util';
import { EndSessionButton } from './end-session-button';
import { useSessionsQuery } from '../services/sessions.query';
import { isSessionActive } from '../lib/status';

// A session's active-ness is time-based, not query-driven, so nothing naturally triggers a
// re-render as one crosses into or out of its window while this page just sits open — this ticks
// every 30s to force a re-check. Not per-second: a session list doesn't need QR-display-level
// precision, just to not go stale over a multi-minute visit.
function useActiveTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);
}

export function SessionsTable() {
  const { data: sessions, isLoading, isError } = useSessionsQuery();
  const { data: classes } = useClassesQuery();
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  useActiveTick();

  const classNameById = new Map(classes?.map((klass) => [klass.id, `${klass.name} (${klass.code})`]));
  const filteredSessions = sessions?.filter((session) => filter === 'all' || isSessionActive(session));

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'active')}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Live now</TabsTrigger>
        </TabsList>
      </Tabs>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Class</TableHead>
            <TableHead>Starts</TableHead>
            <TableHead>Ends</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                Loading sessions...
              </TableCell>
            </TableRow>
          )}

          {isError && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-destructive">
                Couldn&apos;t load sessions.
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !isError && filteredSessions?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                {filter === 'active' ? 'No sessions are live right now.' : 'No sessions scheduled'}
              </TableCell>
            </TableRow>
          )}

          {filteredSessions?.map((session) => {
            const active = isSessionActive(session);
            return (
              <TableRow key={session.id}>
                <TableCell className="py-3 font-medium">{classNameById.get(session.classId) ?? session.classId}</TableCell>
                <TableCell className="py-3">{formatDateTime(session.startsAt)}</TableCell>
                <TableCell className="py-3">{formatDateTime(session.endsAt)}</TableCell>
                <TableCell className="py-3">
                  {active ? <Badge>Live</Badge> : <Badge variant="secondary">Not live</Badge>}
                </TableCell>
                <TableCell className="py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {active && <EndSessionButton sessionId={session.id} />}
                    <Link href={`/sessions/${session.id}`} className="text-sm text-primary hover:underline">
                      View
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
