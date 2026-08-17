import { Injectable } from '@nestjs/common';
import { and, desc, eq, getTableColumns, lt } from 'drizzle-orm';
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
    options?: { cursor?: string; limit?: number },
    executor: DbExecutor = this.databaseService.db,
  ): Promise<{ items: ClassSession[]; nextCursor: string | null }> {
    const limit = options?.limit ?? 20;
    const query = executor
      .select(getTableColumns(classSessions))
      .from(classSessions)
      .innerJoin(classes, eq(classSessions.classId, classes.id))
      .where(
        options?.cursor
          ? and(
              eq(classes.lecturerId, lecturerId),
              lt(classSessions.startsAt, new Date(options.cursor)),
            )
          : eq(classes.lecturerId, lecturerId),
      )
      .orderBy(desc(classSessions.startsAt), desc(classSessions.id))
      .limit(limit + 1);

    const rows = await query;
    let nextCursor: string | null = null;

    if (rows.length > limit) {
      const nextItem = rows.pop();
      nextCursor = nextItem ? nextItem.startsAt.toISOString() : null;
    }

    return { items: rows, nextCursor };
  }

  async findByStudent(
    studentId: string,
    options?: { cursor?: string; limit?: number },
    executor: DbExecutor = this.databaseService.db,
  ): Promise<{ items: ClassSession[]; nextCursor: string | null }> {
    const limit = options?.limit ?? 20;
    const query = executor
      .select(getTableColumns(classSessions))
      .from(classSessions)
      .innerJoin(enrollments, eq(classSessions.classId, enrollments.classId))
      .where(
        options?.cursor
          ? and(
              eq(enrollments.studentId, studentId),
              lt(classSessions.startsAt, new Date(options.cursor)),
            )
          : eq(enrollments.studentId, studentId),
      )
      .orderBy(desc(classSessions.startsAt), desc(classSessions.id))
      .limit(limit + 1);

    const rows = await query;
    let nextCursor: string | null = null;

    if (rows.length > limit) {
      const nextItem = rows.pop();
      nextCursor = nextItem ? nextItem.startsAt.toISOString() : null;
    }

    return { items: rows, nextCursor };
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
