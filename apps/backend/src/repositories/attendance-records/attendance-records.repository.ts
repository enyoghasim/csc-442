import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { attendanceRecords, classSessions } from '../../database/schema';
import type { DbExecutor } from '../../database/database.types';

export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;

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

  // Raw attendance rows for one student, across every session they've ever checked into — the
  // service combines these with their full session list (ClassSessionsRepository.findByStudent)
  // to fill in "absent" for past sessions with no record, the same way findByClassSession does
  // for a single session's roster.
  async findByStudent(
    studentId: string,
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
