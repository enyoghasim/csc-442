import { Card, CardContent } from '@/components/ui/card';
import { AT_RISK_THRESHOLD, computeMatrixMetrics, sessionLabel } from '../lib/matrix';
import type { ClassAttendanceMatrix } from '../types';

function MetricTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 py-4">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold">{value}</span>
        {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
      </CardContent>
    </Card>
  );
}

export function AttendanceMetrics({ matrix }: { matrix: ClassAttendanceMatrix }) {
  const metrics = computeMatrixMetrics(matrix);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <MetricTile label="Sessions held" value={String(metrics.sessionsHeld)} />
      <MetricTile label="Class average" value={`${metrics.averagePercentage}%`} />
      <MetricTile
        label={`Below ${AT_RISK_THRESHOLD}%`}
        value={String(metrics.atRiskCount)}
        hint={metrics.atRiskCount === 1 ? 'student' : 'students'}
      />
      <MetricTile
        label="Best session"
        value={metrics.bestSession ? `${metrics.bestSession.rate}%` : '—'}
        hint={
          metrics.worstSession
            ? `Lowest: ${metrics.worstSession.rate}% (${sessionLabel(metrics.worstSession.session)})`
            : undefined
        }
      />
    </div>
  );
}
