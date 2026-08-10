import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../shared/components/button';
import { ErrorMessage } from '../../shared/components/error-message';
import { ThemedText } from '../../shared/components/themed-text';
import { useCheckInMutation, type CheckInValues } from '../services/attendance.mutation';

// Backend's ThrottlerGuard (5/min/IP) surfaces as a raw "ThrottlerException: Too Many Requests"
// message — friendlier wording for the scanner UI without changing the shared handleApiError()
// unwrapping logic every other domain relies on.
function friendlyErrorMessage(raw: string | string[]): string {
  const message = Array.isArray(raw) ? raw.join(', ') : raw;
  if (message.toLowerCase().includes('too many requests')) {
    return 'Too many attempts — please wait a moment and try again.';
  }
  return message;
}

// The dashboard's live-QR display encodes `JSON.stringify({ classSessionId, token })` — a plain
// JSON string, nothing else. Anything that doesn't parse into that exact shape is "not a valid
// check-in code" rather than a crash.
function parseCheckInPayload(raw: string): CheckInValues | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof (parsed as Record<string, unknown>).classSessionId === 'string' &&
      typeof (parsed as Record<string, unknown>).token === 'string'
    ) {
      const { classSessionId, token } = parsed as { classSessionId: string; token: string };
      return { classSessionId, token };
    }
    return null;
  } catch {
    return null;
  }
}

export const ScannerScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanError, setScanError] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  // Guards against the camera firing onBarcodeScanned repeatedly for the same frame/code while a
  // mutation is already in flight — the throttler is a backstop, not something to lean on here.
  const scanLockedRef = useRef(false);

  const { mutate: checkIn, isPending } = useCheckInMutation();

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (scanLockedRef.current) return;
      scanLockedRef.current = true;
      setScanError(null);

      const payload = parseCheckInPayload(result.data);
      if (!payload) {
        setScanError('That QR code is not a valid check-in code.');
        scanLockedRef.current = false;
        return;
      }

      checkIn(payload, {
        onSuccess: () => {
          setCheckedIn(true);
          setTimeout(() => router.back(), 1200);
        },
        onError: (error) => {
          setScanError(friendlyErrorMessage(error.errors));
          scanLockedRef.current = false;
        },
      });
    },
    [checkIn],
  );

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#3b82f6" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black p-6">
        <ThemedText variant="lg" weight="medium" className="text-center">
          Camera access is required to scan check-in codes.
        </ThemedText>
        <Button title="Grant camera access" onPress={requestPermission} className="mt-6" />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={checkedIn ? undefined : handleBarcodeScanned}
      />

      <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0 p-4">
        {checkedIn && (
          <View className="mb-3 rounded-lg border border-green-900/50 bg-green-900/20 p-3">
            <ThemedText variant="sm" className="text-green-400">
              Checked in successfully.
            </ThemedText>
          </View>
        )}

        {scanError && <ErrorMessage message={scanError} fallback="Check-in failed. Please try again." />}

        {isPending && <ActivityIndicator color="#3b82f6" className="mb-3" />}

        <Button title="Cancel" variant="outline-dark" onPress={() => router.back()} />
      </SafeAreaView>
    </View>
  );
};
