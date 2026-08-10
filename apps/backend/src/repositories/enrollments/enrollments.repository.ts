import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { enrollments } from '../../database/schema';
import type { DbExecutor } from '../../database/database.types';

export type NewEnrollment = typeof enrollments.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;

@Injectable()
export class EnrollmentsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findByStudentAndClass(
    studentId: string,
    classId: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<Enrollment | undefined> {
    const [row] = await executor
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.classId, classId),
        ),
      )
      .limit(1);
    return row;
  }

  async insert(
    enrollment: NewEnrollment,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<Enrollment> {
    const [inserted] = await executor
      .insert(enrollments)
      .values(enrollment)
      .returning();
    return inserted;
  }
}
