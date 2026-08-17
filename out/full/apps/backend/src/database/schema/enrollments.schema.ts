import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { classes } from './classes.schema';

export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    studentId: uuid('student_id')
      .notNull()
      .references(() => users.id),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('enrollments_student_class_idx').on(
      table.studentId,
      table.classId,
    ),
  ],
);
