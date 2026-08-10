import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus } from '@attendance/shared';
import { AttendanceRecordsRepository } from '../../repositories/attendance-records/attendance-records.repository';
import { EnrollmentsRepository } from '../../repositories/enrollments/enrollments.repository';
import { ClassSessionsRepository } from '../../repositories/class-sessions/class-sessions.repository';
import { ClassesRepository } from '../../repositories/classes/classes.repository';
import { ClassSessionsService } from '../class-sessions/class-sessions.service';
import { redis } from '../../config/redis';
import { qrTokenKey } from '../../config/redis-keys';
import { isUniqueViolation } from '../../database/database.types';
import { toCsv } from '../../common/utils/csv.util';

export interface AttendanceHistoryRow {
  classSessionId: string;
  classId: string;
  startsAt: Date;
  endsAt: Date;
  status: AttendanceStatus;
  checkedInAt: Date | null;
}

// One entry per calendar day of the requested month (dense — every day, not just days with a
// session), mirroring a billboard-availability-style month endpoint: the client fetches once per
// visible month and indexes the response by date instead of paging through a flat history list.
export interface DayAttendance {
  date: string; // 'yyyy-MM-dd', UTC
  records: AttendanceHistoryRow[];
}

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

  // One entry per day of the given month (UTC), dense — every day, not just days with a session,
  // same shape the mobile calendar indexes by date. Real record where one exists, 'absent'
  // synthesized for a session that's already ended with no record (mirrors rosterForSession's
  // default-to-absent logic). A session that hasn't ended yet is left out of its day's records
  // entirely, so the calendar doesn't mark today's not-yet-happened class red before its
  // check-in window even opens.
  async historyForStudent(
    studentId: string,
    month: number,
    year: number,
  ): Promise<DayAttendance[]> {
    const [sessions, records] = await Promise.all([
      this.classSessionsRepository.findByStudent(studentId),
      this.attendanceRecordsRepository.findByStudent(studentId),
    ]);

    const recordBySession = new Map(records.map((r) => [r.classSessionId, r]));
    const now = new Date();
    // Date(Date.UTC(year, month, 0)) rolls back to the last day of `month` (1-indexed) — a
    // one-line "days in this month" that already accounts for leap years.
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

    const days: DayAttendance[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const daySessions = sessions.filter(
        (session) =>
          session.startsAt.getUTCFullYear() === year &&
          session.startsAt.getUTCMonth() === month - 1 &&
          session.startsAt.getUTCDate() === day,
      );

      const dayRecords = daySessions
        .filter(
          (session) => recordBySession.has(session.id) || session.endsAt < now,
        )
        .map((session) => {
          const record = recordBySession.get(session.id);
          return {
            classSessionId: session.id,
            classId: session.classId,
            startsAt: session.startsAt,
            endsAt: session.endsAt,
            status: record?.status ?? AttendanceStatus.Absent,
            checkedInAt: record?.checkedInAt ?? null,
          };
        });

      days.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        records: dayRecords,
      });
    }

    return days;
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
