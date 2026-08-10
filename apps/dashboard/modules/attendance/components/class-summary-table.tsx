'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClassSummaryQuery } from '../services/attendance.query';

export function ClassSummaryTable({ classId }: { classId: string | undefined }) {
  const { data: summary, isLoading, isError } = useClassSummaryQuery(classId);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Reg number</TableHead>
          <TableHead>Present / Total</TableHead>
          <TableHead>Percentage</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!classId && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              Pick a class to see its report.
            </TableCell>
          </TableRow>
        )}

        {classId && isLoading && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              Loading report...
            </TableCell>
          </TableRow>
        )}

        {classId && isError && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-destructive">
              Couldn&apos;t load the report.
            </TableCell>
          </TableRow>
        )}

        {classId && !isLoading && !isError && summary?.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              No enrolled students yet.
            </TableCell>
          </TableRow>
        )}

        {summary?.map((entry) => (
          <TableRow key={entry.studentId}>
            <TableCell className="font-medium">{entry.name}</TableCell>
            <TableCell>{entry.regNumber ?? '—'}</TableCell>
            <TableCell>
              {entry.sessionsPresent} / {entry.totalSessions}
            </TableCell>
            <TableCell>{entry.percentage.toFixed(1)}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
