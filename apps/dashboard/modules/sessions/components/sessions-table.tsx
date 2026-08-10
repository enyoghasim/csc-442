'use client';

import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClassesQuery } from '@/modules/classes/services/classes.query';
import { formatDateTime } from '@/modules/shared/lib/util';
import { useSessionsQuery } from '../services/sessions.query';

export function SessionsTable() {
  const { data: sessions, isLoading, isError } = useSessionsQuery();
  const { data: classes } = useClassesQuery();

  const classNameById = new Map(classes?.map((klass) => [klass.id, `${klass.name} (${klass.code})`]));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Class</TableHead>
          <TableHead>Starts</TableHead>
          <TableHead>Ends</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
              Loading sessions...
            </TableCell>
          </TableRow>
        )}

        {isError && (
          <TableRow>
            <TableCell colSpan={4} className="py-8 text-center text-destructive">
              Couldn&apos;t load sessions.
            </TableCell>
          </TableRow>
        )}

        {!isLoading && !isError && sessions?.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
              No sessions scheduled
            </TableCell>
          </TableRow>
        )}

        {sessions?.map((session) => (
          <TableRow key={session.id}>
            <TableCell className="py-3 font-medium">{classNameById.get(session.classId) ?? session.classId}</TableCell>
            <TableCell className="py-3">{formatDateTime(session.startsAt)}</TableCell>
            <TableCell className="py-3">{formatDateTime(session.endsAt)}</TableCell>
            <TableCell className="py-3 text-right">
              <Link href={`/sessions/${session.id}`} className="text-sm text-primary hover:underline">
                View
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
