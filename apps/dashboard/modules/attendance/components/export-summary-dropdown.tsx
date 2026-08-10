'use client';

import { Csv02Icon, Download04Icon, Xls02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { env } from '@/modules/shared/lib/env';
import { useClassSummaryQuery } from '../services/attendance.query';
import { ATTENDANCE_ENDPOINTS } from '../services/attendance.endpoints';

// CSV goes straight through the existing backend endpoint (a top-level <a download> — same-site
// GET, SameSite=Lax cookie works, browser handles the download). Excel has no backend endpoint —
// generated client-side from the already-fetched summary via `xlsx`, since the data's identical
// either way and a second server-rendered format isn't worth a new endpoint + tests for.
export function ExportSummaryDropdown({ classId }: { classId: string | undefined }) {
  const { data: summary } = useClassSummaryQuery(classId);

  const exportExcel = () => {
    if (!classId || !summary) return;

    const rows = summary.map((entry) => ({
      Name: entry.name,
      RegNumber: entry.regNumber ?? '',
      SessionsPresent: entry.sessionsPresent,
      TotalSessions: entry.totalSessions,
      Percentage: `${entry.percentage.toFixed(1)}%`,
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `class-${classId}-attendance.xlsx`);
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
          <a href={`${env.NEXT_PUBLIC_API_URL}${ATTENDANCE_ENDPOINTS.classSummaryExport(classId)}`} download className="cursor-pointer">
            <HugeiconsIcon icon={Csv02Icon} size={16} />
            CSV
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={exportExcel} disabled={!summary}>
          <HugeiconsIcon icon={Xls02Icon} size={16} />
          Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
