import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

export const classes = pgTable('classes', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  // TODO: add business columns (name, code, lecturerId, ...)
});
