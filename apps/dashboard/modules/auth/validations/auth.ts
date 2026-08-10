import { z } from 'zod';

// Dashboard is lecturer-only, so login here is always an email — unlike apps/mobile's regNumber
// login. The field is still named `identifier` to match the backend's generic
// `{ identifier, password }` body (see apps/backend's UsersRepository.findByIdentifier).
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Enter your email'),
  password: z.string().min(1, 'Enter your password'),
});

export type LoginValues = z.infer<typeof loginSchema>;
