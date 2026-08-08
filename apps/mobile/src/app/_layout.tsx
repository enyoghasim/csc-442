import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../global.css';
import { queryClient } from '../modules/shared/services/query-client';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Google Sans Thin': require('../../assets/fonts/GoogleSans-Thin.ttf'),
    'Google Sans ExtraLight': require('../../assets/fonts/GoogleSans-ExtraLight.ttf'),
    'Google Sans Light': require('../../assets/fonts/GoogleSans-Light.ttf'),
    'Google Sans': require('../../assets/fonts/GoogleSans-Regular.ttf'),
    'Google Sans Medium': require('../../assets/fonts/GoogleSans-Medium.ttf'),
    'Google Sans SemiBold': require('../../assets/fonts/GoogleSans-SemiBold.ttf'),
    'Google Sans Bold': require('../../assets/fonts/GoogleSans-Bold.ttf'),
    'Google Sans ExtraBold': require('../../assets/fonts/GoogleSans-ExtraBold.ttf'),
    'Google Sans Black': require('../../assets/fonts/GoogleSans-Black.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: { backgroundColor: '#000000' },
          headerTitleStyle: { fontFamily: 'Google Sans SemiBold', color: '#ffffff' },
          headerTintColor: '#ffffff',
          contentStyle: { backgroundColor: '#000000' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ headerShown: true, title: 'Log in' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scanner" options={{ presentation: 'modal', headerShown: true, title: 'Scan QR' }} />
      </Stack>
    </QueryClientProvider>
  );
}
