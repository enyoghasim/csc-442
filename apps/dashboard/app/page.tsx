import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Tracker — Lecturer Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Use the sidebar to navigate to Classes, Sessions, or Reports.</p>
      </CardContent>
    </Card>
  );
}
