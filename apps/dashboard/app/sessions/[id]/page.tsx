import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// TODO (Sprint 3): live QR display, auto-refreshing (rotating token from GET /api/sessions/:id/qr)
export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session {id}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex aspect-square w-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          QR code placeholder
        </div>
      </CardContent>
    </Card>
  );
}
