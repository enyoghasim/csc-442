import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './button';
import { ThemedText } from './themed-text';

// Static placeholder data — wired to real classes/session data in Sprint 2
const todaysClasses = [
  { id: '1', name: 'Data Structures & Algorithms', time: '10:00 AM' },
  { id: '2', name: 'Operating Systems', time: '2:00 PM' },
];

export const HomeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-black p-4">
      <ThemedText variant="title">Welcome back</ThemedText>

      <View className="mt-6 rounded-xl border border-zinc-700 p-4">
        <ThemedText weight="semibold" className="text-zinc-300">
          Today&apos;s classes
        </ThemedText>
        {todaysClasses.map((c) => (
          <View key={c.id} className="mt-2 flex-row justify-between">
            <ThemedText>{c.name}</ThemedText>
            <ThemedText className="text-zinc-500">{c.time}</ThemedText>
          </View>
        ))}
      </View>

      <Button title="Scan QR" onPress={() => router.push('/(app)/scanner')} className="mt-6" />
    </SafeAreaView>
  );
};
