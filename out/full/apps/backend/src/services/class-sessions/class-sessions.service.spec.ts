import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClassSessionsService } from './class-sessions.service';
import {
  ClassSessionsRepository,
  ClassSession,
} from '../../repositories/class-sessions/class-sessions.repository';
import {
  ClassesRepository,
  Class,
} from '../../repositories/classes/classes.repository';
import {
  UsersRepository,
  User,
} from '../../repositories/users/users.repository';
import { redis } from '../../config/redis';

jest.mock('../../config/redis', () => ({
  redis: { set: jest.fn(), get: jest.fn() },
}));

describe('ClassSessionsService', () => {
  let classSessionsRepository: jest.Mocked<ClassSessionsRepository>;
  let classesRepository: jest.Mocked<ClassesRepository>;
  let usersRepository: jest.Mocked<UsersRepository>;
  let service: ClassSessionsService;

  const lecturerId = 'lecturer-1';
  const klass: Class = {
    id: 'class-1',
    name: 'Software Engineering',
    code: 'CSC 422',
    lecturerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const now = new Date('2026-08-12T10:00:00.000Z');
  const activeSession: ClassSession = {
    id: 'session-1',
    classId: klass.id,
    startsAt: new Date('2026-08-12T09:00:00.000Z'),
    endsAt: new Date('2026-08-12T11:00:00.000Z'),
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
    jest.clearAllMocks();

    classSessionsRepository = {
      findById: jest.fn(),
      findByClassId: jest.fn(),
      findByLecturer: jest.fn(),
      findByStudent: jest.fn(),
      insert: jest.fn(),
    } as unknown as jest.Mocked<ClassSessionsRepository>;
    classesRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ClassesRepository>;
    usersRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;
    service = new ClassSessionsService(
      classSessionsRepository,
      classesRepository,
      usersRepository,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('schedule', () => {
    it('schedules a session for a class the lecturer owns', async () => {
      classesRepository.findById.mockResolvedValue(klass);
      classSessionsRepository.insert.mockResolvedValue(activeSession);

      const result = await service.schedule(lecturerId, {
        classId: klass.id,
        startsAt: '2026-08-12T09:00:00.000Z',
        endsAt: '2026-08-12T11:00:00.000Z',
      });

      expect(result).toBe(activeSession);
    });

    it('throws BadRequest when endsAt is not after startsAt', async () => {
      classesRepository.findById.mockResolvedValue(klass);

      await expect(
        service.schedule(lecturerId, {
          classId: klass.id,
          startsAt: '2026-08-12T11:00:00.000Z',
          endsAt: '2026-08-12T09:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws Forbidden when the lecturer doesn't own the class", async () => {
      classesRepository.findById.mockResolvedValue(klass);

      await expect(
        service.schedule('someone-else', {
          classId: klass.id,
          startsAt: '2026-08-12T09:00:00.000Z',
          endsAt: '2026-08-12T11:00:00.000Z',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFound when the class does not exist', async () => {
      classesRepository.findById.mockResolvedValue(undefined);

      await expect(
        service.schedule(lecturerId, {
          classId: 'missing',
          startsAt: '2026-08-12T09:00:00.000Z',
          endsAt: '2026-08-12T11:00:00.000Z',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listForCurrentUser', () => {
    it('lists sessions for a lecturer', async () => {
      usersRepository.findById.mockResolvedValue({ role: 'lecturer' } as User);
      classSessionsRepository.findByLecturer.mockResolvedValue([activeSession]);

      await expect(service.listForCurrentUser(lecturerId)).resolves.toEqual([
        activeSession,
      ]);
    });

    it('lists sessions for a student', async () => {
      usersRepository.findById.mockResolvedValue({ role: 'student' } as User);
      classSessionsRepository.findByStudent.mockResolvedValue([activeSession]);

      await expect(service.listForCurrentUser('student-1')).resolves.toEqual([
        activeSession,
      ]);
    });

    it('throws Unauthorized when the session user no longer exists', async () => {
      usersRepository.findById.mockResolvedValue(undefined);

      await expect(service.listForCurrentUser('gone')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('issueQrToken', () => {
    it('rotates and returns a fresh token while the session is active', async () => {
      classSessionsRepository.findById.mockResolvedValue(activeSession);
      classesRepository.findById.mockResolvedValue(klass);

      const result = await service.issueQrToken(lecturerId, activeSession.id);

      expect(result.classSessionId).toBe(activeSession.id);
      expect(result.token).toMatch(/^[0-9a-f]{48}$/);
      expect(redis.set).toHaveBeenCalledWith(
        `qr:${activeSession.id}`,
        result.token,
        'EX',
        expect.any(Number),
      );
    });

    it('throws BadRequest before the session starts', async () => {
      classSessionsRepository.findById.mockResolvedValue({
        ...activeSession,
        startsAt: new Date('2026-08-12T12:00:00.000Z'),
        endsAt: new Date('2026-08-12T13:00:00.000Z'),
      });
      classesRepository.findById.mockResolvedValue(klass);

      await expect(
        service.issueQrToken(lecturerId, activeSession.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest after the session ends', async () => {
      classSessionsRepository.findById.mockResolvedValue({
        ...activeSession,
        startsAt: new Date('2026-08-12T07:00:00.000Z'),
        endsAt: new Date('2026-08-12T08:00:00.000Z'),
      });
      classesRepository.findById.mockResolvedValue(klass);

      await expect(
        service.issueQrToken(lecturerId, activeSession.id),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws Forbidden when the lecturer doesn't own the session's class", async () => {
      classSessionsRepository.findById.mockResolvedValue(activeSession);
      classesRepository.findById.mockResolvedValue(klass);

      await expect(
        service.issueQrToken('someone-else', activeSession.id),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFound when the session does not exist', async () => {
      classSessionsRepository.findById.mockResolvedValue(undefined);

      await expect(service.issueQrToken(lecturerId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
