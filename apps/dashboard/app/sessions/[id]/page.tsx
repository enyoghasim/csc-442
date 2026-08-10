import { SessionDetail } from '@/modules/sessions/components/session-detail';

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <SessionDetail sessionId={id} />;
}
