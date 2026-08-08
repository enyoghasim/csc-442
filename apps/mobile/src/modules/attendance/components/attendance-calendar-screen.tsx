import { useState } from 'react';
import { Modal, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';
import { Button } from '../../shared/components/button';
import { ThemedText } from '../../shared/components/themed-text';

// Static placeholder marked dates — wired to real attendance data in Sprint 4
const markedDates = {
  '2026-08-04': { marked: true, dotColor: '#16a34a' },
  '2026-08-05': { marked: true, dotColor: '#16a34a' },
  '2026-08-06': { marked: true, dotColor: '#dc2626' },
};

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

export const AttendanceCalendarScreen = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-black p-4">
      <ThemedText variant="title" className="mb-4">
        My Attendance
      </ThemedText>

      <Calendar theme={darkCalendarTheme} markedDates={markedDates} onDayPress={(day: DateData) => setSelectedDay(day.dateString)} />

      <Modal visible={selectedDay !== null} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/70">
          <View className="w-72 rounded-xl border border-zinc-700 bg-black p-6">
            <ThemedText variant="lg" weight="semibold">
              {selectedDay}
            </ThemedText>
            <ThemedText className="mt-1 text-zinc-500">TODO (Sprint 4): real attendance detail</ThemedText>
            <Button title="Close" variant="outline-dark" className="mt-4" onPress={() => setSelectedDay(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};
