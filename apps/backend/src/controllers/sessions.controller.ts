import { Controller, Get } from '@nestjs/common';
import { ClassSessionsService } from '../services/class-sessions/class-sessions.service';
import { successResponse } from '../common/utils/response-factory';

// Route path is "sessions" (class sessions) — distinct from Redis-backed auth sessions.
@Controller('sessions')
export class SessionsController {
  constructor(private readonly classSessionsService: ClassSessionsService) {}

  @Get()
  list() {
    // TODO (Sprint 2/3): schedule sessions, start a session + generate rotating QR token
    return successResponse([], 'TODO: implement class sessions');
  }
}
