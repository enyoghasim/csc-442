'use client';

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSessionRosterQuery } from '../services/attendance.query';

const statusVariant = {
  present: 'default',
  late: 'secondary',
  absent: 'destructive',
} as const;

export function SessionRosterTable({ sessionId }: { sessionId: string }) {
  // Polls independently of the QR display so the roster reflects new check-ins live.
  const { data: roster, isLoading, isError } = useSessionRosterQuery(sessionId, { refetchInterval: 15_000 });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Reg number</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Checked in</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              Loading roster...
            </TableCell>
          </TableRow>
        )}

        {isError && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-destructive">
              Couldn&apos;t load the roster.
            </TableCell>
          </TableRow>
        )}

        {!isLoading && !isError && roster?.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              No students enrolled in this class yet.
            </TableCell>
          </TableRow>
        )}

        {roster?.map((entry) => (
          <TableRow key={entry.studentId}>
            <TableCell className="font-medium">{entry.name}</TableCell>
            <TableCell>{entry.regNumber ?? '—'}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[entry.status]}>{entry.status}</Badge>
            </TableCell>
            <TableCell>{entry.checkedInAt ? new Date(entry.checkedInAt).toLocaleTimeString() : '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
