import { AttendanceStatus } from '@attendance/shared';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
  todayBackgroundColor: '#3b82f61a',
  monthTextColor: '#ffffff',
  arrowColor: '#3b82f6',
  textDisabledColor: '#3f3f46',
  textDayFontFamily: 'Google Sans',
  textMonthFontFamily: 'Google Sans SemiBold',
  textDayHeaderFontFamily: 'Google Sans Medium',
  textDayFontSize: 15,
  textMonthFontSize: 17,
  textDayHeaderFontSize: 12,
  'stylesheet.day.basic': {
    todayText: { fontFamily: 'Google Sans SemiBold' },
  },
};

// today's UTC month/year — matches the backend's UTC day-bucketing (see attendance.service.ts's
// historyForStudent), so what's "today" here agrees with what the backend calls "today".
function currentUtcMonth() {
  const now = new Date();
  return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };
}

export const AttendanceCalendarScreen = () => {
  const [visibleMonth, setVisibleMonth] = useState(currentUtcMonth);
  // 'yyyy-MM-01' — makes the Calendar's displayed month fully *controlled* by visibleMonth via
  // its `current` prop, rather than trusting react-native-calendars' own uncontrolled internal
  // tracking. Without this, navigating to a month with no cached data yet (any direction, but
  // most noticeable going back) triggered a loading-state remount below that unmounted and
  // remounted <Calendar> — losing its internal displayed-month state and defaulting back to
  // today's month on every uncached navigation. `current` alone would have masked that same bug
  // if something else ever causes a remount again, so both fixes stay.
  const currentMonthString = `${visibleMonth.year}-${String(visibleMonth.month).padStart(2, '0')}-01`;

  // Refetches whenever the visible month changes (onMonthChange below) — react-query caches each
  // { month, year } independently, so flipping back to an already-seen month doesn't re-fetch.
  const { data: days, isLoading, isFetching } = useMyAttendanceQuery(visibleMonth.month, visibleMonth.year);

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
      <View className="mb-2 flex-row items-center justify-between">
        <ThemedText variant="title">My Attendance</ThemedText>
        {/* isFetching (not isLoading) covers month-to-month navigation too, not just first
            mount — a small persistent spinner next to the title instead of swapping the whole
            Calendar out, which is what caused the month-reset bug in the first place. */}
        {isFetching && <ActivityIndicator color="#3b82f6" size="small" />}
      </View>

      <Calendar
        current={currentMonthString}
        theme={darkCalendarTheme}
        markedDates={markedDates}
        enableSwipeMonths
        onDayPress={(day: DateData) => router.push(`/(app)/attendance-day/${day.dateString}`)}
        onMonthChange={(day: DateData) => setVisibleMonth({ month: day.month, year: day.year })}
      />

      {!isLoading && Object.keys(markedDates).length === 0 && (
        <ThemedText className="mt-4 text-center text-zinc-500">No attendance recorded yet this month.</ThemedText>
      )}
    </SafeAreaView>
  );
};
