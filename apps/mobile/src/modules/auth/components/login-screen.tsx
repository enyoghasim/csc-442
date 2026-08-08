import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../shared/components/button';
import { ThemedText } from '../../shared/components/themed-text';

// Placeholder only — no form/validation/API call wired yet (Sprint 1). No register screen exists
// anywhere in this app: accounts are pre-seeded, login is the only auth flow.
export const LoginScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-black px-5 pt-10">
      <Image source={require('../../../../assets/logo-mark.png')} style={{ width: 48, height: 48 }} resizeMode="contain" className="mb-6" />
      <ThemedText variant="title">Log in</ThemedText>
      <ThemedText variant="md" className="mt-2 text-zinc-400">
        Use your school email/matric no. and password.
      </ThemedText>

      <View className="mt-8 gap-4">
        {/* TODO (Sprint 1): real inputs + react-hook-form + zod validation, wired to POST /api/auth/login */}
        <View className="rounded-lg border border-zinc-700 px-4 py-4">
          <ThemedText className="text-zinc-500">Email / Matric No.</ThemedText>
        </View>
        <View className="rounded-lg border border-zinc-700 px-4 py-4">
          <ThemedText className="text-zinc-500">Password</ThemedText>
        </View>
        <Button title="Log in" className="mt-2" />
      </View>
    </SafeAreaView>
  );
};
