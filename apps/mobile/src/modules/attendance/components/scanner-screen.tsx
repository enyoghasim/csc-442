import { View } from 'react-native';
import { ThemedText } from '../../shared/components/themed-text';

// Placeholder only — expo-camera is installed but no scanning logic is wired yet (Sprint 3).
export const ScannerScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-black p-4">
      <ThemedText variant="lg" weight="medium">
        Camera preview placeholder
      </ThemedText>
      <ThemedText className="mt-2 text-center text-zinc-400">TODO (Sprint 3): wire expo-camera QR scanning to the check-in endpoint</ThemedText>
    </View>
  );
};
