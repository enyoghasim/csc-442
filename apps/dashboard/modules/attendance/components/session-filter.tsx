'use client';

import { FilterIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSessionsQuery } from '@/modules/sessions/services/sessions.query';
import { sessionLabel } from '../lib/matrix';

// `undefined` means "every session" throughout — the matrix query and export URLs both treat a
// missing sessionIds param the same way, so there's no separate "all selected" state to track.
export function SessionFilter({
  classId,
  selectedSessionIds,
  onChange,
}: {
  classId: string | undefined;
  selectedSessionIds: string[] | undefined;
  onChange: (sessionIds: string[] | undefined) => void;
}) {
  const { data: sessions } = useSessionsQuery();
  const classSessions = (sessions ?? [])
    .filter((session) => session.classId === classId)
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const selected = selectedSessionIds ?? classSessions.map((session) => session.id);
  const allSelected = selectedSessionIds === undefined;

  const toggle = (sessionId: string, checked: boolean) => {
    const base = selectedSessionIds ?? classSessions.map((session) => session.id);
    const next = checked ? [...base, sessionId] : base.filter((id) => id !== sessionId);
    onChange(next.length === classSessions.length ? undefined : next);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" disabled={!classId || classSessions.length === 0}>
          <HugeiconsIcon icon={FilterIcon} size={16} />
          Sessions{allSelected ? '' : ` (${selected.length}/${classSessions.length})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-64 flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Sessions</span>
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={() => onChange(undefined)}>
            Select all
          </Button>
        </div>
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
          {classSessions.length === 0 && <span className="text-xs text-muted-foreground">No sessions scheduled yet.</span>}
          {classSessions.map((session) => (
            <Label key={session.id} className="flex items-center gap-2 text-sm font-normal">
              <Checkbox
                checked={selected.includes(session.id)}
                onCheckedChange={(checked) => toggle(session.id, checked === true)}
              />
              {sessionLabel(session)}
            </Label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
