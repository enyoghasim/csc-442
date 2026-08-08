import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

// TODO (Sprint 1): read request.session?.userId, throw UnauthorizedException if absent,
// mirroring the session/auth contract in apps/backend/AGENTS.md. Not wired to any route yet.
@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}
