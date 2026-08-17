import type { User } from '../../repositories/users/users.repository';

// Allow-list, not a deny-list — new sensitive columns added to `users` later don't leak here by
// default, they have to be added explicitly.
export interface PublicUser {
  id: string;
  role: User['role'];
  name: string;
  email: string | null;
  regNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    regNumber: user.regNumber,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
