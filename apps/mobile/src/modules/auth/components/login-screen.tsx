import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLoginMutation } from '../services/auth.mutation';
import { loginSchema, LoginValues } from '../validations/auth';
import { Button } from '../../shared/components/button';
import { ErrorMessage } from '../../shared/components/error-message';
import { Input } from '../../shared/components/input';

export const LoginScreen = () => {
  const {
    mutate: login,
    error: loginError,
    isPending: isLoggingIn,
  } = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginValues) => login(data);

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-black">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 justify-center px-6">
          {loginError && (
            <ErrorMessage
              message={loginError?.errors}
              fallback="Login failed. Please check your credentials."
            />
          )}

          <View className="gap-3">
            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Matric no."
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="none"
                  error={errors.identifier?.message}
                  size="lg"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry
                  error={errors.password?.message}
                  size="lg"
                />
              )}
            />

            <Button
              title={isLoggingIn ? 'Signing In...' : 'Log in'}
              onPress={handleSubmit(onSubmit)}
              loading={isLoggingIn}
              className="mt-8"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
