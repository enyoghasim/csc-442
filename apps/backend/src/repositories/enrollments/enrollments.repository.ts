import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { enrollments, users } from '../../database/schema';
import type { DbExecutor } from '../../database/database.types';

export type NewEnrollment = typeof enrollments.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;

export interface EnrolledStudent {
  studentId: string;
  name: string;
  regNumber: string | null;
}

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

  // The full class roster — used to build attendance reports (every enrolled student, whether
  // or not they have an attendance record for a given session).
  async findByClassWithStudents(
    classId: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<EnrolledStudent[]> {
    return executor
      .select({
        studentId: enrollments.studentId,
        name: users.name,
        regNumber: users.regNumber,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.studentId, users.id))
      .where(eq(enrollments.classId, classId));
  }
}
