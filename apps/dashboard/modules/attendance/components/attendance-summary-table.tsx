'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ClassAttendanceMatrix } from '../types';

const PAGE_SIZE = 20;

// Present/absent counts per student, filtered to whichever sessions are currently selected — the
// full per-session breakdown (which session, which status) lives in the export only, not here;
// on screen a lecturer wants "how is this student doing," not a wide grid.
//
// Renders `PAGE_SIZE` rows at a time behind a "Load more" button rather than the whole roster at
// once — a class with dozens of enrolled students turned this into a very long scroll otherwise.
// The parent remounts this component (via a `key` keyed off the selected class) when the class
// changes, which is what resets `visibleCount` back to `PAGE_SIZE` — no manual reset effect
// needed.
export function AttendanceSummaryTable({
  matrix,
  hasClass,
  isLoading,
  isError,
}: {
  matrix: ClassAttendanceMatrix | undefined;
  hasClass: boolean;
  isLoading: boolean;
  isError: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const rows = matrix?.rows ?? [];
  const visibleRows = rows.slice(0, visibleCount);
  const remaining = rows.length - visibleRows.length;

  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Reg number</TableHead>
            <TableHead className="text-center">Present</TableHead>
            <TableHead className="text-center">Absent</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!hasClass && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                Pick a class to see its report.
              </TableCell>
            </TableRow>
          )}

          {hasClass && isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                Loading report...
              </TableCell>
            </TableRow>
          )}

          {hasClass && isError && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-destructive">
                Couldn&apos;t load the report.
              </TableCell>
            </TableRow>
          )}

          {hasClass && !isLoading && !isError && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                No enrolled students yet.
              </TableCell>
            </TableRow>
          )}

          {hasClass &&
            visibleRows.map((row) => (
              <TableRow key={row.studentId}>
                <TableCell className="py-3 font-medium">{row.name}</TableCell>
                <TableCell className="py-3">{row.regNumber ?? '—'}</TableCell>
                <TableCell className="py-3 text-center">{row.sessionsPresent}</TableCell>
                <TableCell className="py-3 text-center">{row.totalSessions - row.sessionsPresent}</TableCell>
                <TableCell className="py-3 text-right font-medium">{row.percentage.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {remaining > 0 && (
        <Button variant="outline" className="self-center" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
          Load more ({remaining} remaining)
        </Button>
      )}
    </div>
  );
}
