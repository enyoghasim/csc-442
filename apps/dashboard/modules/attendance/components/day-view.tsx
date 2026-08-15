'use client';

import { useMemo, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { useClassesQuery } from '@/modules/classes/services/classes.query';
import { useSessionsQuery } from '@/modules/sessions/services/sessions.query';
import { DaySessionCard } from './day-session-card';

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Cross-class by design — a lecturer with two different classes meeting the same day has no
// existing view of "what's on today" without clicking into each class separately. This is that
// view: every session across every class, grouped by the day it falls on.
export function DayView() {
  const { data: sessions } = useSessionsQuery();
  const { data: classes } = useClassesQuery();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const classNameById = new Map(classes?.map((klass) => [klass.id, `${klass.name} (${klass.code})`]));

  // Marks which calendar days have at least one session, so a lecturer can spot a busy day
  // without opening it first — same "dot on a day" idea as apps/mobile's student calendar.
  const sessionDates = useMemo(
    () => (sessions ?? []).map((session) => new Date(session.startsAt)),
    [sessions],
  );

  const daySessions = useMemo(() => {
    if (!selectedDate) return [];
    const key = toDateKey(selectedDate);
    return (sessions ?? [])
      .filter((session) => toDateKey(new Date(session.startsAt)) === key)
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }, [sessions, selectedDate]);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      <Card className="w-full md:w-fit md:shrink-0">
        <CardContent className="flex justify-center p-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            classNames={{ root: 'w-full md:w-fit' }}
            modifiers={{ hasSession: sessionDates }}
            modifiersClassNames={{
              hasSession: 'relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary',
            }}
          />
        </CardContent>
      </Card>

      <div className="flex flex-1 flex-col gap-2">
        {daySessions.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {selectedDate ? 'No sessions scheduled for this day.' : 'Pick a day to see its sessions.'}
          </p>
        )}
        {daySessions.map((session) => (
          <DaySessionCard
            key={session.id}
            session={session}
            className={classNameById.get(session.classId) ?? session.classId}
          />
        ))}
      </div>
    </div>
  );
}
