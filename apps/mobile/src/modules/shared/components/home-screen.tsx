import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useClassesQuery } from '../../classes/services/classes.query';
import { useSessionsQuery } from '../../sessions/services/sessions.query';
import { Button } from './button';
import { ThemedText } from './themed-text';

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export const HomeScreen = () => {
  const router = useRouter();
  const { data: classes } = useClassesQuery();
  const { data: sessions, isLoading: isLoadingSessions } = useSessionsQuery();

  const todaysSessions = (sessions ?? []).filter((session) => isToday(session.startsAt)).sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const classNameFor = (classId: string) => classes?.find((c) => c.id === classId)?.name ?? 'Unknown class';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-black p-4">
      <ThemedText variant="title">Welcome back</ThemedText>

      <View className="mt-6 rounded-xl border border-zinc-700 p-4">
        <ThemedText weight="semibold" className="text-zinc-300">
          Today&apos;s classes
        </ThemedText>

        {isLoadingSessions ? (
          <ActivityIndicator color="#3b82f6" className="mt-4" />
        ) : todaysSessions.length === 0 ? (
          <ThemedText className="mt-2 text-zinc-500">No classes scheduled today.</ThemedText>
        ) : (
          todaysSessions.map((session) => (
            <View key={session.id} className="mt-2 flex-row justify-between">
              <ThemedText>{classNameFor(session.classId)}</ThemedText>
              <ThemedText className="text-zinc-500">{formatTime(session.startsAt)}</ThemedText>
            </View>
          ))
        )}
      </View>

      <Button title="Scan QR" onPress={() => router.push('/(app)/scanner')} className="mt-6" />
    </SafeAreaView>
  );
};
