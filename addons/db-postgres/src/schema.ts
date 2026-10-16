import { pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Demonstration schema: never add auth/session tables to this optional piece.
export const legoApp = pgSchema('lego_app');

export const notes = legoApp.table('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
