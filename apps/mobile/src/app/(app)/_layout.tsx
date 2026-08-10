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
      <Stack.Screen name="attendance-day/[date]" options={{ headerShown: true, title: 'Attendance' }} />
    </Stack>
  );
}
