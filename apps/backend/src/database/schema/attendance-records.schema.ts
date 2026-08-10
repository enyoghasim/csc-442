import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { attendanceStatusEnum } from './enums.schema';
import { classSessions } from './class-sessions.schema';
import { users } from './users.schema';

export const attendanceRecords = pgTable(
  'attendance_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    classSessionId: uuid('class_session_id')
      .notNull()
      .references(() => classSessions.id),
    studentId: uuid('student_id')
      .notNull()
      .references(() => users.id),
    status: attendanceStatusEnum('status').notNull(),
    // Null until the student actually scans in (e.g. a record pre-created as 'absent').
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('attendance_records_session_student_idx').on(
      table.classSessionId,
      table.studentId,
    ),
  ],
);
