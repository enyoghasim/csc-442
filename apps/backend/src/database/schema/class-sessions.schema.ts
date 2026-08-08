import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

// Named `class_sessions` (Postgres) / classSessions (TS) to avoid confusion with the auth
// "session" concept, which lives only in Redis (see src/config/session.ts) — never in Postgres.
export const classSessions = pgTable('class_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  // TODO: add business columns (classId, date, startTime, endTime, ...)
});
