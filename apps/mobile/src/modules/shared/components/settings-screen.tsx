import { View } from 'react-native';
import { Button } from './button';
import { ThemedText } from './themed-text';

export const SettingsScreen = () => {
  return (
    <View className="flex-1 bg-black p-4">
      <ThemedText variant="title">Settings</ThemedText>

      <View className="mt-6 rounded-xl border border-zinc-700 p-4">
        <ThemedText weight="semibold" className="text-zinc-300">
          Profile
        </ThemedText>
        <ThemedText className="mt-1 text-zinc-500">Name — placeholder</ThemedText>
        <ThemedText className="text-zinc-500">Matric No — placeholder</ThemedText>
      </View>

      {/* TODO (Sprint 1): wire to logout — clearSessionId() + destroy backend session */}
      <Button title="Log out" variant="outline-dark" textClassName="text-red-500" className="mt-6 border-red-500" />
    </View>
  );
};
