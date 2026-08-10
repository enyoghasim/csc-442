import { z } from 'zod';

// Hour/minute are collected as separate dropdowns (not a native datetime-local input — see
// schedule-session-dialog.tsx) sharing one calendar date, so a session's start and end are always
// the same day. `combineDateTime` composes a real Date from the three once the form has all of
// them, used both by the cross-field refine below and by the dialog to build the ISO strings the
// backend actually wants.
export function combineDateTime(date: Date, hour: string, minute: string): Date {
  const combined = new Date(date);
  combined.setHours(Number(hour), Number(minute), 0, 0);
  return combined;
}

export const scheduleSessionSchema = z
  .object({
    classId: z.string().min(1, 'Select a class'),
    date: z.date({ message: 'Pick a date' }),
    startHour: z.string().min(1, 'Pick a start time'),
    startMinute: z.string().min(1, 'Pick a start time'),
    endHour: z.string().min(1, 'Pick an end time'),
    endMinute: z.string().min(1, 'Pick an end time'),
  })
  .refine(
    (values) => combineDateTime(values.date, values.endHour, values.endMinute) > combineDateTime(values.date, values.startHour, values.startMinute),
    { message: 'End time must be after start time', path: ['endHour'] },
  );

export type ScheduleSessionValues = z.infer<typeof scheduleSessionSchema>;
