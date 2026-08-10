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

// Never render a bare numeric date like "10/08/26" anywhere in this app — ambiguous
// (DD/MM/YY vs MM/DD/YY depending on locale) and doesn't read as a real date at a glance.
// `formatHeaderDate` is the concise form for the native header title ("Aug 10, 2026");
// dateString is 'yyyy-MM-dd' (UTC) — parsed as UTC so the displayed date can't shift a day
// depending on the device's local timezone.
export function formatHeaderDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
