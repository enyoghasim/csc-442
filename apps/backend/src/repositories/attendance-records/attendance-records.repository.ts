import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { attendanceRecords, classSessions } from '../../database/schema';
import type { DbExecutor } from '../../database/database.types';

export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;

export interface AttendanceHistoryRow {
  classSessionId: string;
  classId: string;
  startsAt: Date;
  endsAt: Date;
  status: AttendanceRecord['status'];
  checkedInAt: Date | null;
}

export interface ClassAttendanceRow {
  classSessionId: string;
  studentId: string;
  status: AttendanceRecord['status'];
  checkedInAt: Date | null;
}

@Injectable()
export class AttendanceRecordsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async insert(
    record: NewAttendanceRecord,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<AttendanceRecord> {
    const [inserted] = await executor
      .insert(attendanceRecords)
      .values(record)
      .returning();
    return inserted;
  }

  // A student's full attendance history, joined with the session it belongs to (start/end +
  // class) so the mobile calendar has everything it needs without a second round trip.
  async findByStudent(
    studentId: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<AttendanceHistoryRow[]> {
    return executor
      .select({
        classSessionId: attendanceRecords.classSessionId,
        classId: classSessions.classId,
        startsAt: classSessions.startsAt,
        endsAt: classSessions.endsAt,
        status: attendanceRecords.status,
        checkedInAt: attendanceRecords.checkedInAt,
      })
      .from(attendanceRecords)
      .innerJoin(
        classSessions,
        eq(attendanceRecords.classSessionId, classSessions.id),
      )
      .where(eq(attendanceRecords.studentId, studentId));
  }

  // Raw attendance rows for one session — combined with the enrollment roster by the service to
  // fill in "absent" for students with no record.
  async findByClassSession(
    classSessionId: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<ClassAttendanceRow[]> {
    return executor
      .select({
        classSessionId: attendanceRecords.classSessionId,
        studentId: attendanceRecords.studentId,
        status: attendanceRecords.status,
        checkedInAt: attendanceRecords.checkedInAt,
      })
      .from(attendanceRecords)
      .where(eq(attendanceRecords.classSessionId, classSessionId));
  }

  // Raw attendance rows across every session of a class — the service aggregates these
  // per-student into a present/total percentage for the class report.
  async findByClass(
    classId: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<ClassAttendanceRow[]> {
    return executor
      .select({
        classSessionId: attendanceRecords.classSessionId,
        studentId: attendanceRecords.studentId,
        status: attendanceRecords.status,
        checkedInAt: attendanceRecords.checkedInAt,
      })
      .from(attendanceRecords)
      .innerJoin(
        classSessions,
        eq(attendanceRecords.classSessionId, classSessions.id),
      )
      .where(eq(classSessions.classId, classId));
  }
}
