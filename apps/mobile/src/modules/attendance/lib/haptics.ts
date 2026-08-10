import { Platform, Vibration } from 'react-native';

// expo-haptics' notificationAsync(Success) is a single short system pulse (a few hundred ms) —
// too subtle to register as "the scan worked" when the phone might be in a pocket or a noisy
// room. Android's Vibration API supports a genuine continuous multi-second buzz. iOS has no
// public API for a custom-duration single vibration (Vibration.vibrate(ms) silently ignores the
// duration there) — approximate a sustained ~3s buzz instead with a tight repeating pattern of
// short system buzzes.
export function longSuccessVibration() {
  if (Platform.OS === 'android') {
    Vibration.vibrate(3000);
    return;
  }
  const pattern = Array.from({ length: 7 }, () => [50, 400]).flat();
  Vibration.vibrate(pattern);
}
