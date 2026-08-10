import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@attendance/shared';

export const ROLES_KEY = 'roles';

// Marks a route as requiring one of the given roles. Read by RolesGuard, which looks the
// current user's role up fresh from the DB rather than trusting anything cached at login time.
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
