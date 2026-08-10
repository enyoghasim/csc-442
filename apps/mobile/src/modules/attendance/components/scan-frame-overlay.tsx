import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { ThemedText } from '../../shared/components/themed-text';

const FRAME_SIZE = 260;
const CORNER_SIZE = 36;
const CORNER_THICKNESS = 4;
const ACCENT = '#3b82f6';
const SCRIM = 'rgba(0,0,0,0.55)';

// The bounded viewfinder + corner brackets + animated scan line every real QR scanner uses —
// dims everything outside the frame so it's obvious exactly what area the camera is reading,
// rather than a bare full-screen camera preview with no visual guidance.
//
// `width`/`height` must be the *measured* size of this overlay's own container (an onLayout
// result), not useWindowDimensions() — this screen is pushed under a native header
// (presentation: 'modal', headerShown: true), so the window's full height overcounts the actual
// visible camera area by the header's height, which pushed the frame below true center.
export function ScanFrameOverlay({ width, height }: { width: number; height: number }) {
  const verticalBarHeight = Math.max(0, (height - FRAME_SIZE) / 2);

  const scanLineY = useSharedValue(0);

  useEffect(() => {
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(FRAME_SIZE - 2, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [scanLineY]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ height: verticalBarHeight, backgroundColor: SCRIM }} />

      <View style={{ height: FRAME_SIZE, flexDirection: 'row' }}>
        <View style={{ width: (width - FRAME_SIZE) / 2, backgroundColor: SCRIM }} />

        <View style={{ width: FRAME_SIZE, height: FRAME_SIZE }}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <Animated.View style={[styles.scanLine, scanLineStyle]} />
        </View>

        <View style={{ width: (width - FRAME_SIZE) / 2, backgroundColor: SCRIM }} />
      </View>

      <View style={{ flex: 1, backgroundColor: SCRIM, alignItems: 'center', justifyContent: 'center' }}>
        <ThemedText variant="md" weight="medium" className="px-8 text-center text-white">
          Align the QR code within the frame
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: ACCENT,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});
