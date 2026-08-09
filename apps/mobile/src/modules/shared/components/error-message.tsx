import { View } from 'react-native';
import { ThemedText } from './themed-text';

type ErrorMessageProps = {
  message?: string | string[];
  fallback: string;
};

export function ErrorMessage({ message, fallback }: ErrorMessageProps) {
  if (Array.isArray(message) && message.length > 1) {
    return (
      <View className="mb-4 gap-1 rounded-lg border border-red-900/50 bg-red-900/20 p-3">
        {(message.length > 0 ? message : [fallback]).map((item, index) => (
          <View key={index} className="flex-row gap-2">
            <ThemedText variant="sm" className="text-red-400">
              •
            </ThemedText>
            <ThemedText variant="sm" className="flex-1 text-red-400">
              {item}
            </ThemedText>
          </View>
        ))}
      </View>
    );
  }

  const singleMessage = Array.isArray(message) ? message[0] : message;

  return (
    <View className="mb-4 rounded-lg border border-red-900/50 bg-red-900/20 p-3">
      <ThemedText variant="sm" className="text-red-400">
        {singleMessage || fallback}
      </ThemedText>
    </View>
  );
}
