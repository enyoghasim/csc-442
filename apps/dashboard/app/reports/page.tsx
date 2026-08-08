import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// TODO (Sprint 4): attendance % per student per class, CSV export
export default function ReportsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">No report data yet.</p>
        <Button variant="outline" className="w-fit" disabled>
          Export CSV
        </Button>
      </CardContent>
    </Card>
  );
}
