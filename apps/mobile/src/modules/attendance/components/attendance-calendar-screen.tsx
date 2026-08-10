import { AttendanceStatus } from '@attendance/shared';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../shared/components/themed-text';
import { useMyAttendanceQuery } from '../services/attendance.query';

const darkCalendarTheme = {
  backgroundColor: '#000000',
  calendarBackground: '#000000',
  textSectionTitleColor: '#a1a1aa',
  dayTextColor: '#ffffff',
  todayTextColor: '#3b82f6',
  monthTextColor: '#ffffff',
  arrowColor: '#ffffff',
  textDisabledColor: '#3f3f46',
  textDayFontFamily: 'Google Sans',
  textMonthFontFamily: 'Google Sans SemiBold',
  textDayHeaderFontFamily: 'Google Sans Medium',
};

// today's UTC month/year — matches the backend's UTC day-bucketing (see attendance.service.ts's
// historyForStudent), so what's "today" here agrees with what the backend calls "today".
function currentUtcMonth() {
  const now = new Date();
  return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };
}

export const AttendanceCalendarScreen = () => {
  const [visibleMonth, setVisibleMonth] = useState(currentUtcMonth);

  // Refetches whenever the visible month changes (onMonthChange below) — react-query caches each
  // { month, year } independently, so flipping back to an already-seen month doesn't re-fetch.
  const { data: days, isLoading } = useMyAttendanceQuery(visibleMonth.month, visibleMonth.year);

  // Only a day the student actually attended (a real present/late scan) gets a dot — a day with
  // no session, or a session they missed, is left blank rather than flagged red. Tapping any day
  // (dotted or not) still opens its detail page.
  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string }> = {};
    for (const day of days ?? []) {
      const attended = day.records.some((record) => record.status === AttendanceStatus.Present || record.status === AttendanceStatus.Late);
      if (attended) marks[day.date] = { marked: true, dotColor: '#16a34a' };
    }
    return marks;
  }, [days]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-black p-4">
      <ThemedText variant="title" className="mb-4">
        My Attendance
      </ThemedText>

      {isLoading ? (
        <ActivityIndicator color="#3b82f6" className="mt-8" />
      ) : (
        <Calendar
          theme={darkCalendarTheme}
          markedDates={markedDates}
          onDayPress={(day: DateData) => router.push(`/(app)/attendance-day/${day.dateString}`)}
          onMonthChange={(day: DateData) => setVisibleMonth({ month: day.month, year: day.year })}
        />
      )}
    </SafeAreaView>
  );
};
