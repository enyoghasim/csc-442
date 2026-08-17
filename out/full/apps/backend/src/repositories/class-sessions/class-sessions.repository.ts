import { Injectable } from '@nestjs/common';
import { eq, getTableColumns } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { classSessions, classes, enrollments } from '../../database/schema';
import type { DbExecutor } from '../../database/database.types';

export type NewClassSession = typeof classSessions.$inferInsert;
export type ClassSession = typeof classSessions.$inferSelect;

@Injectable()
export class ClassSessionsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(
    id: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<ClassSession | undefined> {
    const [row] = await executor
      .select()
      .from(classSessions)
      .where(eq(classSessions.id, id))
      .limit(1);
    return row;
  }

  async findByClassId(
    classId: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<ClassSession[]> {
    return executor
      .select()
      .from(classSessions)
      .where(eq(classSessions.classId, classId));
  }

  async findByLecturer(
    lecturerId: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<ClassSession[]> {
    return executor
      .select(getTableColumns(classSessions))
      .from(classSessions)
      .innerJoin(classes, eq(classSessions.classId, classes.id))
      .where(eq(classes.lecturerId, lecturerId));
  }

  async findByStudent(
    studentId: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<ClassSession[]> {
    return executor
      .select(getTableColumns(classSessions))
      .from(classSessions)
      .innerJoin(enrollments, eq(classSessions.classId, enrollments.classId))
      .where(eq(enrollments.studentId, studentId));
  }

  async insert(
    newSession: NewClassSession,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<ClassSession> {
    const [inserted] = await executor
      .insert(classSessions)
      .values(newSession)
      .returning();
    return inserted;
  }

  async update(
    id: string,
    patch: Partial<Pick<NewClassSession, 'startsAt' | 'endsAt'>>,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<ClassSession | undefined> {
    const [updated] = await executor
      .update(classSessions)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(classSessions.id, id))
      .returning();
    return updated;
  }
}
