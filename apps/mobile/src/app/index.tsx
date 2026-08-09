import { Redirect, router } from 'expo-router';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentUserQuery } from '../modules/auth/services/auth.query';
import { OverlayVideo } from '../modules/auth/components/overlay-video';
import { Button } from '../modules/shared/components/button';
import { ThemedText } from '../modules/shared/components/themed-text';

export default function LandingRoute() {
  const { data: user, isLoading } = useCurrentUserQuery();

  if (isLoading) return null;
  if (user) return <Redirect href="/(app)/(tabs)" />;

  return (
    <>
      <OverlayVideo />
      <SafeAreaView className="flex-1 justify-between p-5">
        <View className="mt-6 flex-row items-center gap-3">
          <Image source={require('../../assets/logo-mark.png')} style={{ width: 40, height: 40 }} resizeMode="contain" />
          <ThemedText weight="semibold" variant="lg">
            TrackX
          </ThemedText>
        </View>

        <View className="mb-24 gap-5">
          <Button title="Log in" onPress={() => router.push('/(auth)/login')} />
        </View>
      </SafeAreaView>
    </>
  );
}
