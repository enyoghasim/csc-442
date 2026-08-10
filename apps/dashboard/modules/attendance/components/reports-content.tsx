'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClassesQuery } from '@/modules/classes/services/classes.query';
import { ClassSummaryTable } from './class-summary-table';
import { ExportSummaryLink } from './export-summary-link';

export function ReportsContent() {
  const { data: classes } = useClassesQuery();
  const [classId, setClassId] = useState<string | undefined>(undefined);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Select value={classId} onValueChange={setClassId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder={classes?.length ? 'Select a class' : 'No classes yet'} />
          </SelectTrigger>
          <SelectContent>
            {classes?.map((klass) => (
              <SelectItem key={klass.id} value={klass.id}>
                {klass.name} ({klass.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ExportSummaryLink classId={classId} />
      </div>

      <ClassSummaryTable classId={classId} />
    </div>
  );
}
