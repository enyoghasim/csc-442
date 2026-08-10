import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportsContent } from '@/modules/attendance/components/reports-content';

export default function ReportsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <ReportsContent />
      </CardContent>
    </Card>
  );
}
