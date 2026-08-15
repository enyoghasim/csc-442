'use client';

import { useState } from 'react';
import { Calendar03Icon, Table01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClassesQuery } from '@/modules/classes/services/classes.query';
import { useClassMatrixQuery } from '../services/attendance.query';
import { AttendanceMetrics } from './attendance-metrics';
import { AttendanceSummaryTable } from './attendance-summary-table';
import { DayView } from './day-view';
import { ExportMatrixDropdown } from './export-matrix-dropdown';
import { SessionFilter } from './session-filter';

function ClassReport() {
  const { data: classes } = useClassesQuery();
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [sessionIds, setSessionIds] = useState<string[] | undefined>(undefined);

  const { data: matrix, isLoading, isError } = useClassMatrixQuery(classId, sessionIds);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={classId}
          onValueChange={(value) => {
            setClassId(value);
            setSessionIds(undefined);
          }}
        >
          <SelectTrigger className="w-full sm:w-64">
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

        <div className="flex gap-2">
          <SessionFilter classId={classId} selectedSessionIds={sessionIds} onChange={setSessionIds} />
          <ExportMatrixDropdown classId={classId} sessionIds={sessionIds} matrix={matrix} />
        </div>
      </div>

      {matrix && matrix.rows.length > 0 && <AttendanceMetrics matrix={matrix} />}

      <AttendanceSummaryTable
        key={classId ?? 'none'}
        matrix={matrix}
        hasClass={!!classId}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
}

export function ReportsContent() {
  return (
    <Tabs defaultValue="class">
      <TabsList>
        <TabsTrigger value="class">
          <HugeiconsIcon icon={Table01Icon} size={16} />
          By class
        </TabsTrigger>
        <TabsTrigger value="day">
          <HugeiconsIcon icon={Calendar03Icon} size={16} />
          By day
        </TabsTrigger>
      </TabsList>
      <TabsContent value="class">
        <ClassReport />
      </TabsContent>
      <TabsContent value="day">
        <DayView />
      </TabsContent>
    </Tabs>
  );
}
