import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceRecordsRepository } from '../../repositories/attendance-records/attendance-records.repository';
import { EnrollmentsRepository } from '../../repositories/enrollments/enrollments.repository';
import {
  ClassSessionsRepository,
  ClassSession,
} from '../../repositories/class-sessions/class-sessions.repository';
import {
  ClassesRepository,
  Class,
} from '../../repositories/classes/classes.repository';
import { ClassSessionsService } from '../class-sessions/class-sessions.service';
import { redis } from '../../config/redis';

jest.mock('../../config/redis', () => ({
  redis: { set: jest.fn(), get: jest.fn() },
}));

describe('AttendanceService', () => {
  let attendanceRecordsRepository: jest.Mocked<AttendanceRecordsRepository>;
  let enrollmentsRepository: jest.Mocked<EnrollmentsRepository>;
  let classSessionsRepository: jest.Mocked<ClassSessionsRepository>;
  let classesRepository: jest.Mocked<ClassesRepository>;
  let classSessionsService: jest.Mocked<ClassSessionsService>;
  let service: AttendanceService;

  const lecturerId = 'lecturer-1';
  const studentId = 'student-1';
  const now = new Date('2026-08-12T10:00:00.000Z');

  const klass: Class = {
    id: 'class-1',
    name: 'Software Engineering',
    code: 'CSC 422',
    lecturerId,
    createdAt: now,
    updatedAt: now,
  };

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

    attendanceRecordsRepository = {
      insert: jest.fn(),
      findByStudent: jest.fn(),
      findByClassSession: jest.fn(),
      findByClass: jest.fn(),
    } as unknown as jest.Mocked<AttendanceRecordsRepository>;
    enrollmentsRepository = {
      findByStudentAndClass: jest.fn(),
      insert: jest.fn(),
      findByClassWithStudents: jest.fn(),
    } as unknown as jest.Mocked<EnrollmentsRepository>;
    classSessionsRepository = {
      findById: jest.fn(),
      findByClassId: jest.fn(),
      findByStudent: jest.fn(),
    } as unknown as jest.Mocked<ClassSessionsRepository>;
    classesRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ClassesRepository>;
    classSessionsService = {
      getOwnedSession: jest.fn(),
    } as unknown as jest.Mocked<ClassSessionsService>;

    service = new AttendanceService(
      attendanceRecordsRepository,
      enrollmentsRepository,
      classSessionsRepository,
      classesRepository,
      classSessionsService,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('checkIn', () => {
    it('writes a present record when the window, enrollment, and token all match', async () => {
      classSessionsRepository.findById.mockResolvedValue(activeSession);
      enrollmentsRepository.findByStudentAndClass.mockResolvedValue({
        id: 'enrollment-1',
        studentId,
        classId: klass.id,
        createdAt: now,
        updatedAt: now,
      });
      (redis.get as jest.Mock).mockResolvedValue('the-real-token');

      await service.checkIn(studentId, activeSession.id, 'the-real-token');

      expect(attendanceRecordsRepository.insert).toHaveBeenCalledWith({
        classSessionId: activeSession.id,
        studentId,
        status: 'present',
        checkedInAt: now,
      });
    });

    it('throws NotFound when the session does not exist', async () => {
      classSessionsRepository.findById.mockResolvedValue(undefined);

      await expect(
        service.checkIn(studentId, 'missing', 'token'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequest outside the session window', async () => {
      classSessionsRepository.findById.mockResolvedValue({
        ...activeSession,
        startsAt: new Date('2026-08-12T12:00:00.000Z'),
        endsAt: new Date('2026-08-12T13:00:00.000Z'),
      });

      await expect(
        service.checkIn(studentId, activeSession.id, 'token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws Forbidden when the student is not enrolled', async () => {
      classSessionsRepository.findById.mockResolvedValue(activeSession);
      enrollmentsRepository.findByStudentAndClass.mockResolvedValue(undefined);

      await expect(
        service.checkIn(studentId, activeSession.id, 'token'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequest when the token does not match Redis', async () => {
      classSessionsRepository.findById.mockResolvedValue(activeSession);
      enrollmentsRepository.findByStudentAndClass.mockResolvedValue({
        id: 'enrollment-1',
        studentId,
        classId: klass.id,
        createdAt: now,
        updatedAt: now,
      });
      (redis.get as jest.Mock).mockResolvedValue('a-different-token');

      await expect(
        service.checkIn(studentId, activeSession.id, 'stale-token'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws Conflict on a duplicate check-in', async () => {
      classSessionsRepository.findById.mockResolvedValue(activeSession);
      enrollmentsRepository.findByStudentAndClass.mockResolvedValue({
        id: 'enrollment-1',
        studentId,
        classId: klass.id,
        createdAt: now,
        updatedAt: now,
      });
      (redis.get as jest.Mock).mockResolvedValue('the-real-token');
      attendanceRecordsRepository.insert.mockRejectedValue({ code: '23505' });

      await expect(
        service.checkIn(studentId, activeSession.id, 'the-real-token'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('historyForStudent', () => {
    const pastSession: ClassSession = {
      id: 'past-no-record',
      classId: klass.id,
      startsAt: new Date('2026-08-11T09:00:00.000Z'),
      endsAt: new Date('2026-08-11T11:00:00.000Z'),
      createdAt: now,
      updatedAt: now,
    };
    const futureSession: ClassSession = {
      id: 'future-no-record',
      classId: klass.id,
      startsAt: new Date('2026-08-13T09:00:00.000Z'),
      endsAt: new Date('2026-08-13T11:00:00.000Z'),
      createdAt: now,
      updatedAt: now,
    };

    it('returns one dense entry per day of the month, absent for a past session with no record, empty for a future one', async () => {
      classSessionsRepository.findByStudent.mockResolvedValue([
        activeSession,
        pastSession,
        futureSession,
      ]);
      attendanceRecordsRepository.findByStudent.mockResolvedValue([
        {
          classSessionId: activeSession.id,
          studentId,
          status: 'present',
          checkedInAt: now,
        },
      ]);

      // `now` is fixed to 2026-08-12T10:00:00.000Z (see the top-level beforeEach).
      const result = await service.historyForStudent(studentId, 8, 2026);

      expect(result).toHaveLength(31); // August has 31 days — dense, every day gets an entry.

      expect(result.find((d) => d.date === '2026-08-12')?.records).toEqual([
        {
          classSessionId: activeSession.id,
          classId: activeSession.classId,
          startsAt: activeSession.startsAt,
          endsAt: activeSession.endsAt,
          status: 'present',
          checkedInAt: now,
        },
      ]);
      expect(result.find((d) => d.date === '2026-08-11')?.records).toEqual([
        {
          classSessionId: pastSession.id,
          classId: pastSession.classId,
          startsAt: pastSession.startsAt,
          endsAt: pastSession.endsAt,
          status: 'absent',
          checkedInAt: null,
        },
      ]);
      // futureSession has no record and hasn't ended yet — its day's records must stay empty.
      expect(result.find((d) => d.date === '2026-08-13')?.records).toEqual([]);
      // A day with no session at all is still present in the dense array, just empty.
      expect(result.find((d) => d.date === '2026-08-01')?.records).toEqual([]);
    });
  });

  describe('rosterForSession', () => {
    it('fills in absent for enrolled students with no attendance record', async () => {
      classSessionsService.getOwnedSession.mockResolvedValue(activeSession);
      enrollmentsRepository.findByClassWithStudents.mockResolvedValue([
        {
          studentId: 'present-student',
          name: 'Present Student',
          regNumber: '1',
        },
        { studentId: 'absent-student', name: 'Absent Student', regNumber: '2' },
      ]);
      attendanceRecordsRepository.findByClassSession.mockResolvedValue([
        {
          classSessionId: activeSession.id,
          studentId: 'present-student',
          status: 'present',
          checkedInAt: now,
        },
      ]);

      const result = await service.rosterForSession(
        lecturerId,
        activeSession.id,
      );

      expect(result).toEqual([
        {
          studentId: 'present-student',
          name: 'Present Student',
          regNumber: '1',
          status: 'present',
          checkedInAt: now,
        },
        {
          studentId: 'absent-student',
          name: 'Absent Student',
          regNumber: '2',
          status: 'absent',
          checkedInAt: null,
        },
      ]);
    });
  });

  describe('classSummary', () => {
    it('computes a present/total percentage per student', async () => {
      classesRepository.findById.mockResolvedValue(klass);
      enrollmentsRepository.findByClassWithStudents.mockResolvedValue([
        { studentId: 'student-a', name: 'Student A', regNumber: '1' },
        { studentId: 'student-b', name: 'Student B', regNumber: '2' },
      ]);
      classSessionsRepository.findByClassId.mockResolvedValue([
        activeSession,
        { ...activeSession, id: 'session-2' },
      ]);
      attendanceRecordsRepository.findByClass.mockResolvedValue([
        {
          classSessionId: activeSession.id,
          studentId: 'student-a',
          status: 'present',
          checkedInAt: now,
        },
        {
          classSessionId: 'session-2',
          studentId: 'student-a',
          status: 'late',
          checkedInAt: now,
        },
      ]);

      const result = await service.classSummary(lecturerId, klass.id);

      expect(result).toEqual([
        {
          studentId: 'student-a',
          name: 'Student A',
          regNumber: '1',
          sessionsPresent: 2,
          totalSessions: 2,
          percentage: 100,
        },
        {
          studentId: 'student-b',
          name: 'Student B',
          regNumber: '2',
          sessionsPresent: 0,
          totalSessions: 2,
          percentage: 0,
        },
      ]);
    });

    it("throws Forbidden when the lecturer doesn't own the class", async () => {
      classesRepository.findById.mockResolvedValue(klass);

      await expect(
        service.classSummary('someone-else', klass.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
