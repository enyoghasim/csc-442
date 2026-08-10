import { AttendanceStatus } from '@attendance/shared';

// Shared between attendance-calendar-screen.tsx and attendance-day-screen.tsx so the two don't
// drift on label/color choices.
export const statusLabels: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Present]: 'Present',
  [AttendanceStatus.Late]: 'Late',
  [AttendanceStatus.Absent]: 'Absent',
};

export const statusTextClasses: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Present]: 'text-green-400',
  [AttendanceStatus.Late]: 'text-yellow-400',
  [AttendanceStatus.Absent]: 'text-red-400',
};

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatDateHeading(dateString: string): string {
  // dateString is 'yyyy-MM-dd' (UTC) — parse as UTC so the displayed date can't shift a day
  // depending on the device's local timezone.
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
