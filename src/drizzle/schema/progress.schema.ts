import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { challenges } from './challenge.schema';

// Progress type enum
export const progressTypeEnum = pgEnum('challenge_type', [
  'ninety',
  'thirty',
  'replacement',
]);

export const progressLogs = pgTable('progress_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  challenge_id: uuid('challenge_id').references(() => challenges.id, {
    onDelete: 'cascade',
  }),
  user_id: text('user_id').notNull(),
  challenge_type: progressTypeEnum('challenge_type').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true })
    .default(sql`TIMEZONE('utc'::text, NOW())`)
    .notNull(),
  data: jsonb('data')
    .default(sql`'{}'::jsonb`)
    .notNull(),
});

export const progressLogsRelations = relations(progressLogs, ({ one }) => ({
  challenge: one(challenges, {
    fields: [progressLogs.challenge_id],
    references: [challenges.id],
  }),
}));
