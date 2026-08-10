import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Redirect, router, Stack } from 'expo-router';
import { Pressable } from 'react-native';
import { useCurrentUserQuery } from '../../modules/auth/services/auth.query';

// Mirrors the reference app's (auth) group: redirect away from login if a session already
// exists, so a logged-in user can't navigate back into the auth stack.
export default function AuthLayout() {
  const { data: user, isLoading } = useCurrentUserQuery();

  if (isLoading) return null;
  if (user) return <Redirect href="/(app)/(tabs)" />;

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
      <Stack.Screen
        name="login"
        options={{
          headerShown: true,
          title: 'Log in',
          headerTitleAlign: 'center',
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
