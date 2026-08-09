// Mirrors apps/backend's PublicUser shape verbatim (common/utils/serialize-user.ts) — camelCase,
// not snake_case, since that's what our own backend actually serializes (unlike the reference
// app's backend, which used snake_case — don't blindly copy that convention here).
export type UserRole = 'student' | 'lecturer';

export type User = {
  id: string;
  role: UserRole;
  name: string;
  email: string | null;
  regNumber: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: User;
};
