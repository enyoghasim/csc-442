import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

export const attendanceRecords = pgTable('attendance_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  // TODO: add business columns (classSessionId, studentId, status, checkedInAt, ...)
});
