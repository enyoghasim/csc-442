import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums.schema';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    role: userRoleEnum('role').notNull(),
    name: text('name').notNull(),
    // Lecturers log in with email; students log in with regNumber. Exactly one of the two is set
    // per user, enforced at the application layer (seed script), not a DB constraint.
    email: text('email'),
    regNumber: text('reg_number'),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
    uniqueIndex('users_reg_number_idx').on(table.regNumber),
  ],
);
