import { AttendanceStatus } from '@attendance/shared';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useClassesQuery } from '../../classes/services/classes.query';
import { Button } from '../../shared/components/button';
import { ThemedText } from '../../shared/components/themed-text';
import { useMyAttendanceQuery } from '../services/attendance.query';
import type { AttendanceHistoryRecord } from '../types';

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

const statusLabels: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Present]: 'Present',
  [AttendanceStatus.Late]: 'Late',
  [AttendanceStatus.Absent]: 'Absent',
};

const statusTextClasses: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Present]: 'text-green-400',
  [AttendanceStatus.Late]: 'text-yellow-400',
  [AttendanceStatus.Absent]: 'text-red-400',
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

// today's UTC month/year — matches the backend's UTC day-bucketing (see attendance.service.ts's
// historyForStudent), so what's "today" here agrees with what the backend calls "today".
function currentUtcMonth() {
  const now = new Date();
  return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };
}

export const AttendanceCalendarScreen = () => {
  const [visibleMonth, setVisibleMonth] = useState(currentUtcMonth);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Refetches whenever the visible month changes (onMonthChange below) — react-query caches each
  // { month, year } independently, so flipping back to an already-seen month doesn't re-fetch.
  const { data: days, isLoading } = useMyAttendanceQuery(visibleMonth.month, visibleMonth.year);
  const { data: classes } = useClassesQuery();

  const classNameFor = (classId: string) => classes?.find((c) => c.id === classId)?.name ?? 'Unknown class';

  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceHistoryRecord[]>();
    for (const day of days ?? []) {
      if (day.records.length > 0) map.set(day.date, day.records);
    }
    return map;
  }, [days]);

  // A day with any attended (present/late) session shows green; a day where every session was
  // missed shows red — matching the dotColor values the placeholder UI already used.
  const markedDates = useMemo(() => {
    const marks: Record<string, { marked: boolean; dotColor: string }> = {};
    for (const [date, dayRecords] of recordsByDate.entries()) {
      const attendedAny = dayRecords.some((record) => record.status === AttendanceStatus.Present || record.status === AttendanceStatus.Late);
      marks[date] = { marked: true, dotColor: attendedAny ? '#16a34a' : '#dc2626' };
    }
    return marks;
  }, [recordsByDate]);

  const selectedRecords = selectedDay ? (recordsByDate.get(selectedDay) ?? []) : [];

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
          onDayPress={(day: DateData) => setSelectedDay(day.dateString)}
          onMonthChange={(day: DateData) => setVisibleMonth({ month: day.month, year: day.year })}
        />
      )}

      <Modal visible={selectedDay !== null} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/70">
          <View className="w-72 rounded-xl border border-zinc-700 bg-black p-6">
            <ThemedText variant="lg" weight="semibold">
              {selectedDay}
            </ThemedText>

            {selectedRecords.length === 0 ? (
              <ThemedText className="mt-1 text-zinc-500">No attendance record for this date.</ThemedText>
            ) : (
              <View className="mt-3 gap-3">
                {selectedRecords.map((record) => (
                  <View key={record.classSessionId}>
                    <ThemedText weight="medium">{classNameFor(record.classId)}</ThemedText>
                    <ThemedText className={statusTextClasses[record.status]}>{statusLabels[record.status]}</ThemedText>
                    {record.checkedInAt && (
                      <ThemedText variant="sm" className="text-zinc-500">
                        Checked in at {formatTime(record.checkedInAt)}
                      </ThemedText>
                    )}
                  </View>
                ))}
              </View>
            )}

            <Button title="Close" variant="outline-dark" className="mt-4" onPress={() => setSelectedDay(null)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
