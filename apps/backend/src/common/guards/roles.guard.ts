import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { UserRole } from '@attendance/shared';
import { UsersRepository } from '../../repositories/users/users.repository';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Runs after SessionAuthGuard (which populates request.currentUserId). Roles are looked up
// fresh from the DB on every check — never trusted from session state, since a role change
// mid-session must take effect immediately, not at next login.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request>();
    if (!request.currentUserId) {
      throw new UnauthorizedException('Not authenticated');
    }

    const user = await this.usersRepository.findById(request.currentUserId);
    if (!user) throw new UnauthorizedException('Session user no longer exists');

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role for this route');
    }

    return true;
  }
}
