import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentUserQuery } from '../../auth/services/auth.query';
import { useLogoutMutation } from '../../auth/services/auth.mutation';
import { Button } from './button';
import { ThemedText } from './themed-text';

export const SettingsScreen = () => {
  const { data: user } = useCurrentUserQuery();
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-black p-4">
      <ThemedText variant="title">Settings</ThemedText>

      <View className="mt-6 rounded-xl border border-zinc-700 p-4">
        <ThemedText weight="semibold" className="text-zinc-300">
          Profile
        </ThemedText>
        <ThemedText className="mt-1 text-zinc-500">Name — {user?.name ?? '—'}</ThemedText>
        <ThemedText className="text-zinc-500">{user?.role === 'lecturer' ? `Email — ${user.email ?? '—'}` : `Matric No — ${user?.regNumber ?? '—'}`}</ThemedText>
      </View>

      <Button
        title={isLoggingOut ? 'Logging out...' : 'Log out'}
        variant="outline-dark"
        textClassName="text-red-500"
        className="mt-6 border-red-500"
        loading={isLoggingOut}
        onPress={() => logout()}
      />
    </SafeAreaView>
  );
};
