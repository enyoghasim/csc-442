import { z } from 'zod';

// `startsAt`/`endsAt` come from <input type="datetime-local">, so they're local-time strings
// without a timezone (e.g. "2026-08-12T09:00") at this stage — converted to ISO 8601 right before
// the request leaves in services/sessions.mutation.ts. Validated as local-time Dates here too, so
// the client-side check matches what the backend will actually compare
// (`endsAt <= startsAt` -> 400).
export const scheduleSessionSchema = z
  .object({
    classId: z.string().min(1, 'Select a class'),
    startsAt: z.string().min(1, 'Pick a start time'),
    endsAt: z.string().min(1, 'Pick an end time'),
  })
  .refine((values) => new Date(values.endsAt) > new Date(values.startsAt), {
    message: 'End time must be after start time',
    path: ['endsAt'],
  });

export type ScheduleSessionValues = z.infer<typeof scheduleSessionSchema>;
