import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, View, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../shared/components/button';
import { ErrorMessage } from '../../shared/components/error-message';
import { ThemedText } from '../../shared/components/themed-text';
import { longSuccessVibration } from '../lib/haptics';
import { useCheckInMutation, type CheckInValues } from '../services/attendance.mutation';
import { ScanFrameOverlay } from './scan-frame-overlay';

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
  // Set the instant any scan resolves — success, a rejected check-in, or an unparseable code — so
  // the camera stops feeding onBarcodeScanned entirely. Previously only `checkedIn` (the success
  // case) disabled scanning; on an error or an invalid code, scanLockedRef reset to false right
  // away and the same code still sitting in frame kept re-triggering handleBarcodeScanned on the
  // next camera frame — a loop of repeated error toasts/vibrations/mutation calls, not a one-shot
  // scan. Now an error/invalid scan freezes the camera until the student taps "Restart scan".
  const [scanned, setScanned] = useState(false);
  // The overlay needs the *real* rendered size of this container (see scan-frame-overlay.tsx's
  // comment) — measured via onLayout rather than useWindowDimensions(), which overcounts by the
  // native header's height on this pushed/modal screen.
  const [layout, setLayout] = useState<{ width: number; height: number } | null>(null);
  // Guards against the camera firing onBarcodeScanned for more than one frame before `scanned`
  // state has actually propagated and disabled the CameraView's callback.
  const scanLockedRef = useRef(false);

  const { mutate: checkIn, isPending } = useCheckInMutation();

  const onContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  }, []);

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (scanLockedRef.current) return;
      scanLockedRef.current = true;
      // Fires the instant a QR shape is detected, before we even know if it's a valid check-in
      // code — same "something happened" signal a real scanner gives on every read.
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setScanError(null);

      const payload = parseCheckInPayload(result.data);
      if (!payload) {
        setScanError('That QR code is not a valid check-in code.');
        setScanned(true);
        return;
      }

      checkIn(payload, {
        onSuccess: () => {
          void longSuccessVibration();
          setCheckedIn(true);
          setScanned(true);
          setTimeout(() => router.back(), 1200);
        },
        onError: (error) => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setScanError(friendlyErrorMessage(error.errors));
          setScanned(true);
        },
      });
    },
    [checkIn],
  );

  const restartScanning = useCallback(() => {
    scanLockedRef.current = false;
    setScanError(null);
    setScanned(false);
  }, []);

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
    <View className="flex-1 bg-black" onLayout={onContainerLayout}>
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      {!scanned && layout && <ScanFrameOverlay width={layout.width} height={layout.height} />}

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

        {scanned && !checkedIn && <Button title="Restart scan" onPress={restartScanning} className="mb-3" />}

        <Button title="Cancel" variant="outline-dark" onPress={() => router.back()} />
      </SafeAreaView>
    </View>
  );
};
