'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/modules/shared/components/error-message';
import { useLoginMutation } from '../services/auth.mutation';
import { loginSchema, type LoginValues } from '../validations/auth';

// Ported from apps/mobile's modules/auth/components/login-screen.tsx: react-hook-form + zod +
// Controller-wrapped inputs, minus the RN-specific bits (no KeyboardAvoidingView/SafeAreaView).
export function LoginForm() {
  const { mutate: login, error: loginError, isPending: isLoggingIn } = useLoginMutation();

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
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)} noValidate>
      {loginError && <ErrorMessage message={loginError.errors} fallback="Login failed. Please check your credentials." />}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="identifier">Email</Label>
        <Controller
          control={control}
          name="identifier"
          render={({ field }) => (
            <Input id="identifier" type="email" autoComplete="username" placeholder="lecturer@csc422.local" aria-invalid={!!errors.identifier} {...field} />
          )}
        />
        {errors.identifier && <span className="text-xs text-destructive">{errors.identifier.message}</span>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...field} />
          )}
        />
        {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
      </div>

      <Button type="submit" disabled={isLoggingIn} className="mt-2">
        {isLoggingIn ? 'Signing In...' : 'Log in'}
      </Button>
    </form>
  );
}
