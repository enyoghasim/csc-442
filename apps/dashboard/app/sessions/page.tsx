import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScheduleSessionDialog } from '@/modules/sessions/components/schedule-session-dialog';
import { SessionsTable } from '@/modules/sessions/components/sessions-table';

export default function SessionsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Class Sessions</CardTitle>
        <ScheduleSessionDialog />
      </CardHeader>
      <CardContent>
        <SessionsTable />
      </CardContent>
    </Card>
  );
}
