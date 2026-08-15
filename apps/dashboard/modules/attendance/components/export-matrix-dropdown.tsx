'use client';

import { Csv02Icon, Download04Icon, Xls02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { env } from '@/modules/shared/lib/env';
import { sessionLabel, statusLabels } from '../lib/matrix';
import { ATTENDANCE_ENDPOINTS } from '../services/attendance.endpoints';
import type { ClassAttendanceMatrix } from '../types';

// CSV goes through the backend's matrix endpoint (same sessionIds filter the on-screen table
// uses). Excel has no backend endpoint — built client-side from the same matrix data already on
// screen via `xlsx`, same reasoning as the old per-class summary export.
export function ExportMatrixDropdown({
  classId,
  sessionIds,
  matrix,
}: {
  classId: string | undefined;
  sessionIds: string[] | undefined;
  matrix: ClassAttendanceMatrix | undefined;
}) {
  const exportExcel = () => {
    if (!classId || !matrix) return;

    const rows = matrix.rows.map((row) => {
      const record: Record<string, string | number> = { Name: row.name, RegNumber: row.regNumber ?? '' };
      for (const session of matrix.sessions) {
        const status = row.statuses[session.id];
        record[sessionLabel(session)] = status ? statusLabels[status] : '';
      }
      record.Percentage = `${row.percentage.toFixed(1)}%`;
      return record;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `class-${classId}-attendance-matrix.xlsx`);
  };

  if (!classId) {
    return (
      <Button variant="outline" disabled>
        <HugeiconsIcon icon={Download04Icon} size={16} />
        Export
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <HugeiconsIcon icon={Download04Icon} size={16} />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a
            href={`${env.NEXT_PUBLIC_API_URL}${ATTENDANCE_ENDPOINTS.classMatrixExport(classId, sessionIds)}`}
            download
            className="cursor-pointer"
          >
            <HugeiconsIcon icon={Csv02Icon} size={16} />
            CSV
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={exportExcel} disabled={!matrix}>
          <HugeiconsIcon icon={Xls02Icon} size={16} />
          Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
