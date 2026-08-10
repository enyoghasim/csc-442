import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useClassesQuery } from '../../classes/services/classes.query';
import { ThemedText } from '../../shared/components/themed-text';
import { useMyAttendanceQuery } from '../services/attendance.query';
import { formatDateHeading, formatTime, statusLabels, statusTextClasses } from '../lib/status';

// Reachable by tapping a day on the calendar (attendance-calendar-screen.tsx pushes
// /(app)/attendance-day/<yyyy-MM-dd>) — shows everything the student scanned that day. Refetches
// through the same useMyAttendanceQuery(month, year) the calendar uses, so this hits react-query's
// cache rather than a fresh request whenever the calendar's month is already loaded.
export const AttendanceDayScreen = ({ date }: { date: string }) => {
  const [year, month] = date.split('-').map(Number);
  const { data: days, isLoading } = useMyAttendanceQuery(month, year);
  const { data: classes } = useClassesQuery();

  const classNameFor = (classId: string) => classes?.find((c) => c.id === classId)?.name ?? 'Unknown class';
  const records = days?.find((d) => d.date === date)?.records ?? [];

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-black p-4">
      <ThemedText variant="title" className="mb-4">
        {formatDateHeading(date)}
      </ThemedText>

      {isLoading ? (
        <ActivityIndicator color="#3b82f6" className="mt-8" />
      ) : records.length === 0 ? (
        <ThemedText className="text-zinc-500">No attendance record for this date.</ThemedText>
      ) : (
        <View className="gap-4">
          {records.map((record) => (
            <View key={record.classSessionId} className="rounded-xl border border-zinc-800 p-4">
              <ThemedText variant="lg" weight="semibold">
                {classNameFor(record.classId)}
              </ThemedText>
              <ThemedText className={statusTextClasses[record.status]}>{statusLabels[record.status]}</ThemedText>
              {record.checkedInAt && (
                <ThemedText variant="sm" className="mt-1 text-zinc-500">
                  Checked in at {formatTime(record.checkedInAt)}
                </ThemedText>
              )}
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};
