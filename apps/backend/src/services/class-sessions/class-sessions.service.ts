import { Injectable } from '@nestjs/common';
import { ClassSessionsRepository } from '../../repositories/class-sessions/class-sessions.repository';

@Injectable()
export class ClassSessionsService {
  constructor(
    private readonly classSessionsRepository: ClassSessionsRepository,
  ) {}

  // TODO: schedule a class session (Sprint 2), start a session + generate rotating QR token
  // in Redis via config/redis-keys.ts's qrTokenKey (Sprint 3)
}
