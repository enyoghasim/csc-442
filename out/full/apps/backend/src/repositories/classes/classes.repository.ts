import { Injectable } from '@nestjs/common';
import { eq, getTableColumns } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { classes, enrollments } from '../../database/schema';
import type { DbExecutor } from '../../database/database.types';

export type NewClass = typeof classes.$inferInsert;
export type Class = typeof classes.$inferSelect;

@Injectable()
export class ClassesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(
    id: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<Class | undefined> {
    const [row] = await executor
      .select()
      .from(classes)
      .where(eq(classes.id, id))
      .limit(1);
    return row;
  }

  async findByLecturer(
    lecturerId: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<Class[]> {
    return executor
      .select()
      .from(classes)
      .where(eq(classes.lecturerId, lecturerId));
  }

  // Classes a student is enrolled in — joins through enrollments, but still returns Class rows,
  // so this lives here rather than in the enrollments repository.
  async findByStudent(
    studentId: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<Class[]> {
    return executor
      .select(getTableColumns(classes))
      .from(enrollments)
      .innerJoin(classes, eq(enrollments.classId, classes.id))
      .where(eq(enrollments.studentId, studentId));
  }

  async insert(
    newClass: NewClass,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<Class> {
    const [inserted] = await executor
      .insert(classes)
      .values(newClass)
      .returning();
    return inserted;
  }

  async update(
    id: string,
    patch: Partial<Pick<NewClass, 'name' | 'code'>>,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<Class | undefined> {
    const [updated] = await executor
      .update(classes)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(classes.id, id))
      .returning();
    return updated;
  }
}
