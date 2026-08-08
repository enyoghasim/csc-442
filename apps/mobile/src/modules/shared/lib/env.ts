import Constants from 'expo-constants';

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? (Constants.expoConfig?.extra?.apiUrl as string | undefined);

if (!apiUrl) {
  throw new Error('EXPO_PUBLIC_API_URL is not set — check your .env / app.json config');
}

export const env = {
  EXPO_PUBLIC_API_URL: apiUrl,
};
