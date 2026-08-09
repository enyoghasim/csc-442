import { z } from 'zod';

// Mobile is student-only, so login here is regNumber only — lecturer email login only happens on
// the dashboard. The field is still named `identifier` to match the backend's generic
// `{ identifier, password }` body (see apps/backend's UsersRepository.findByIdentifier), which
// accepts either; the app just never sends anything but a regNumber through it.
export const loginSchema = z.object({
  identifier: z.string().min(1, 'Enter your matric number'),
  password: z.string().min(1, 'Enter your password'),
});

export type LoginValues = z.infer<typeof loginSchema>;
