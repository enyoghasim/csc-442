import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import {
  ClassSessionsRepository,
  ClassSession,
} from '../../repositories/class-sessions/class-sessions.repository';
import { ClassesRepository } from '../../repositories/classes/classes.repository';
import { UsersRepository } from '../../repositories/users/users.repository';
import { redis } from '../../config/redis';
import { QR_TOKEN_TTL_SECONDS, qrTokenKey } from '../../config/redis-keys';

interface ScheduleInput {
  classId: string;
  startsAt: string;
  endsAt: string;
}

export interface QrToken {
  classSessionId: string;
  token: string;
  expiresAt: Date;
}

@Injectable()
export class ClassSessionsService {
  constructor(
    private readonly classSessionsRepository: ClassSessionsRepository,
    private readonly classesRepository: ClassesRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async schedule(
    lecturerId: string,
    data: ScheduleInput,
  ): Promise<ClassSession> {
    const klass = await this.classesRepository.findById(data.classId);
    if (!klass) throw new NotFoundException('Class not found');
    if (klass.lecturerId !== lecturerId) {
      throw new ForbiddenException("You don't own this class");
    }

    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(data.endsAt);
    if (endsAt <= startsAt) {
      throw new BadRequestException('endsAt must be after startsAt');
    }

    return this.classSessionsRepository.insert({
      classId: data.classId,
      startsAt,
      endsAt,
    });
  }

  // Same role-aware pattern as ClassesService.listForCurrentUser.
  async listForCurrentUser(userId: string): Promise<ClassSession[]> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new UnauthorizedException('Session user no longer exists');

    return user.role === 'lecturer'
      ? this.classSessionsRepository.findByLecturer(userId)
      : this.classSessionsRepository.findByStudent(userId);
  }

  // Rotates the QR check-in token: a fresh random token replaces whatever was in Redis, with a
  // new TTL. The dashboard polls this endpoint to keep the displayed QR code rotating.
  async issueQrToken(lecturerId: string, sessionId: string): Promise<QrToken> {
    const session = await this.getOwnedSession(lecturerId, sessionId);

    const now = new Date();
    if (now < session.startsAt || now > session.endsAt) {
      throw new BadRequestException('Session is not currently active');
    }

    const token = randomBytes(24).toString('hex');
    await redis.set(qrTokenKey(sessionId), token, 'EX', QR_TOKEN_TTL_SECONDS);

    return {
      classSessionId: sessionId,
      token,
      expiresAt: new Date(now.getTime() + QR_TOKEN_TTL_SECONDS * 1000),
    };
  }

  // Exposed for AttendanceService's session-roster endpoint, which needs the same ownership
  // check without duplicating it.
  async getOwnedSession(
    lecturerId: string,
    sessionId: string,
  ): Promise<ClassSession> {
    const session = await this.classSessionsRepository.findById(sessionId);
    if (!session) throw new NotFoundException('Class session not found');

    const klass = await this.classesRepository.findById(session.classId);
    if (!klass || klass.lecturerId !== lecturerId) {
      throw new ForbiddenException("You don't own this class session");
    }
    return session;
  }
}
