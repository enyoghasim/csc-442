'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/modules/shared/components/error-message';
import { useLoginMutation } from '../services/auth.mutation';
import { loginSchema, type LoginValues } from '../validations/auth';

export function LoginForm() {
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
    <form
      className="flex flex-col gap-5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {loginError && (
        <ErrorMessage
          message={loginError.errors}
          fallback="Login failed. Please check your credentials."
        />
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="identifier" className="text-base">
          Email
        </Label>
        <Controller
          control={control}
          name="identifier"
          render={({ field }) => (
            <Input
              id="identifier"
              type="email"
              autoComplete="username"
              placeholder="lecturer@csc422.local"
              aria-invalid={!!errors.identifier}
              className="h-12 px-4 text-base"
              {...field}
            />
          )}
        />
        {errors.identifier && (
          <span className="text-sm text-destructive">
            {errors.identifier.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password" className="text-base">
          Password
        </Label>
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              className="h-12 px-4 text-base"
              {...field}
            />
          )}
        />
        {errors.password && (
          <span className="text-sm text-destructive">
            {errors.password.message}
          </span>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoggingIn}
        className="mt-2 h-12 text-base font-semibold"
      >
        {isLoggingIn ? 'Signing In...' : 'Log in'}
      </Button>
    </form>
  );
}
