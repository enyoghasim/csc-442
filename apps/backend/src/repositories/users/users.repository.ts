import { Injectable } from '@nestjs/common';
import { eq, or } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { users } from '../../database/schema';
import type { DbExecutor } from '../../database/database.types';

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(
    id: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<User | undefined> {
    const [user] = await executor
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return user;
  }

  // Lecturers authenticate with email, students with regNumber — a single login form accepts
  // either and this looks up whichever one matches.
  async findByIdentifier(
    identifier: string,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<User | undefined> {
    const [user] = await executor
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.regNumber, identifier)))
      .limit(1);
    return user;
  }

  async insert(
    user: NewUser,
    executor: DbExecutor = this.databaseService.db,
  ): Promise<User> {
    const [inserted] = await executor.insert(users).values(user).returning();
    return inserted;
  }
}
