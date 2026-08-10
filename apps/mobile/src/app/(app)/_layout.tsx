import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Redirect, router, Stack } from 'expo-router';
import { Pressable } from 'react-native';
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
          viewed) via its own nested <Stack.Screen options={...}>. headerBackTitle: '' alone still
          let iOS fall back to rendering the PREVIOUS screen's route name — "(tabs)", since that
          Stack.Screen above has no title of its own — once the empty string collapsed. Same fix
          as (auth)/_layout.tsx's login screen: hide the default back button entirely and render a
          plain icon-only one, so there's no route-derived label left to leak through. */}
      <Stack.Screen
        name="attendance-day/[date]"
        options={{
          headerShown: true,
          headerBackVisible: false,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={12} className="-ml-2 h-10 w-10 items-center justify-center">
              <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color="#ffffff" />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
