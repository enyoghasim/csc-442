import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus } from '@attendance/shared';
import {
  AttendanceRecordsRepository,
  AttendanceHistoryRow,
} from '../../repositories/attendance-records/attendance-records.repository';
import { EnrollmentsRepository } from '../../repositories/enrollments/enrollments.repository';
import { ClassSessionsRepository } from '../../repositories/class-sessions/class-sessions.repository';
import { ClassesRepository } from '../../repositories/classes/classes.repository';
import { ClassSessionsService } from '../class-sessions/class-sessions.service';
import { redis } from '../../config/redis';
import { qrTokenKey } from '../../config/redis-keys';
import { isUniqueViolation } from '../../database/database.types';
import { toCsv } from '../../common/utils/csv.util';

export interface SessionRosterEntry {
  studentId: string;
  name: string;
  regNumber: string | null;
  status: AttendanceStatus | 'absent';
  checkedInAt: Date | null;
}

export interface ClassAttendanceSummaryEntry {
  studentId: string;
  name: string;
  regNumber: string | null;
  sessionsPresent: number;
  totalSessions: number;
  percentage: number;
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRecordsRepository: AttendanceRecordsRepository,
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly classSessionsRepository: ClassSessionsRepository,
    private readonly classesRepository: ClassesRepository,
    private readonly classSessionsService: ClassSessionsService,
  ) {}

  async checkIn(
    studentId: string,
    classSessionId: string,
    token: string,
  ): Promise<void> {
    const session = await this.classSessionsRepository.findById(classSessionId);
    if (!session) throw new NotFoundException('Class session not found');

    const now = new Date();
    if (now < session.startsAt || now > session.endsAt) {
      throw new BadRequestException(
        'Check-in window is closed for this session',
      );
    }

    const enrollment = await this.enrollmentsRepository.findByStudentAndClass(
      studentId,
      session.classId,
    );
    if (!enrollment) {
      throw new ForbiddenException('You are not enrolled in this class');
    }

    const currentToken = await redis.get(qrTokenKey(classSessionId));
    if (!currentToken || currentToken !== token) {
      throw new BadRequestException('Invalid or expired QR code');
    }

    try {
      await this.attendanceRecordsRepository.insert({
        classSessionId,
        studentId,
        status: AttendanceStatus.Present,
        checkedInAt: now,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Already checked in for this session');
      }
      throw error;
    }
  }

  async historyForStudent(studentId: string): Promise<AttendanceHistoryRow[]> {
    return this.attendanceRecordsRepository.findByStudent(studentId);
  }

  // Every enrolled student, with 'absent' filled in for anyone missing an attendance record.
  async rosterForSession(
    lecturerId: string,
    classSessionId: string,
  ): Promise<SessionRosterEntry[]> {
    const session = await this.classSessionsService.getOwnedSession(
      lecturerId,
      classSessionId,
    );

    const [roster, records] = await Promise.all([
      this.enrollmentsRepository.findByClassWithStudents(session.classId),
      this.attendanceRecordsRepository.findByClassSession(classSessionId),
    ]);

    const recordByStudent = new Map(records.map((r) => [r.studentId, r]));

    return roster.map((student) => {
      const record = recordByStudent.get(student.studentId);
      return {
        studentId: student.studentId,
        name: student.name,
        regNumber: student.regNumber,
        status: record?.status ?? 'absent',
        checkedInAt: record?.checkedInAt ?? null,
      };
    });
  }

  async classSummary(
    lecturerId: string,
    classId: string,
  ): Promise<ClassAttendanceSummaryEntry[]> {
    const klass = await this.classesRepository.findById(classId);
    if (!klass) throw new NotFoundException('Class not found');
    if (klass.lecturerId !== lecturerId) {
      throw new ForbiddenException("You don't own this class");
    }

    const [roster, sessions, records] = await Promise.all([
      this.enrollmentsRepository.findByClassWithStudents(classId),
      this.classSessionsRepository.findByClassId(classId),
      this.attendanceRecordsRepository.findByClass(classId),
    ]);

    const totalSessions = sessions.length;
    const presentCounts = new Map<string, number>();
    for (const record of records) {
      if (record.status === 'present' || record.status === 'late') {
        presentCounts.set(
          record.studentId,
          (presentCounts.get(record.studentId) ?? 0) + 1,
        );
      }
    }

    return roster.map((student) => {
      const sessionsPresent = presentCounts.get(student.studentId) ?? 0;
      const percentage =
        totalSessions === 0
          ? 0
          : Math.round((sessionsPresent / totalSessions) * 1000) / 10;
      return {
        studentId: student.studentId,
        name: student.name,
        regNumber: student.regNumber,
        sessionsPresent,
        totalSessions,
        percentage,
      };
    });
  }

  async classSummaryCsv(lecturerId: string, classId: string): Promise<string> {
    const summary = await this.classSummary(lecturerId, classId);
    return toCsv(
      ['Name', 'RegNumber', 'SessionsPresent', 'TotalSessions', 'Percentage'],
      summary.map((s) => [
        s.name,
        s.regNumber ?? '',
        s.sessionsPresent,
        s.totalSessions,
        `${s.percentage}%`,
      ]),
    );
  }
}
