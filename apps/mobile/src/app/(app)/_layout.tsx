import { Redirect, Stack } from 'expo-router';
import { useCurrentUserQuery } from '../../modules/auth/services/auth.query';

// Mirrors the reference app's (app) group: this is the authenticated-only stack, gated on
// useCurrentUserQuery rather than a TODO now that login actually sets a session.
export default function AppLayout() {
  const { data: user, isLoading } = useCurrentUserQuery();

  if (isLoading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#000000' },
        headerTitleStyle: { fontFamily: 'Google Sans SemiBold', color: '#ffffff' },
        headerTintColor: '#ffffff',
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="scanner" options={{ presentation: 'modal', headerShown: true, title: 'Scan QR' }} />
      {/* No static title here — attendance-day-screen.tsx sets it per-instance (the date being
          viewed) via its own nested <Stack.Screen options={...}>. headerBackTitle is set here
          since it doesn't vary: without it, the back button falls back to the PREVIOUS screen's
          route name — "(tabs)", since that Stack.Screen above has no title of its own — which is
          not a string a user should ever see. */}
      <Stack.Screen name="attendance-day/[date]" options={{ headerShown: true, headerBackTitle: '' }} />
    </Stack>
  );
}
