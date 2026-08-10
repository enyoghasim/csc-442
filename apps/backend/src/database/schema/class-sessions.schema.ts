import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { classes } from './classes.schema';

// Named `class_sessions` (Postgres) / classSessions (TS) to avoid confusion with the auth
// "session" concept, which lives only in Redis (see src/config/session.ts) — never in Postgres.
export const classSessions = pgTable('class_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  classId: uuid('class_id')
    .notNull()
    .references(() => classes.id),
  // The check-in window: QR check-in (Sprint 3) validates the current time falls within
  // [startsAt, endsAt] before accepting a scan.
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
