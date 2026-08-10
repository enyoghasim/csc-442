import { Button } from '@/components/ui/button';
import { env } from '@/modules/shared/lib/env';
import { ATTENDANCE_ENDPOINTS } from '../services/attendance.endpoints';

// Deliberately a plain top-level <a download> rather than fetch+blob: it's a same-site GET
// navigation, so the SameSite=Lax session cookie is sent, and the browser handles the download
// (Content-Disposition: attachment) on its own — no axios/blob plumbing needed.
export function ExportSummaryLink({ classId }: { classId: string | undefined }) {
  if (!classId) {
    return (
      <Button variant="outline" disabled>
        Export CSV
      </Button>
    );
  }

  return (
    <Button variant="outline" asChild>
      <a href={`${env.NEXT_PUBLIC_API_URL}${ATTENDANCE_ENDPOINTS.classSummaryExport(classId)}`} download>
        Export CSV
      </a>
    </Button>
  );
}
