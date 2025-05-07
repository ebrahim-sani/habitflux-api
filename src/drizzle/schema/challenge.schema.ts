import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  pgEnum,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.schema';
import { progressLogs } from './progress.schema';

// Enums
export const challengeTypeEnum = pgEnum('challenge_type', [
  'ninety',
  'thirty',
  'replacement',
]);

export const challenges = pgTable('challenges', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  challenge_type: challengeTypeEnum('challenge_type').notNull(),
  created_at: timestamp('created_at', { withTimezone: true })
    .default(sql`TIMEZONE('utc'::text, NOW())`)
    .notNull(),

  // Common fields
  data: jsonb('data')
    .default(sql`'{}'::jsonb`)
    .notNull(),

  // Ninety day challenge fields
  habit: text('habit'),
  goal: text('goal'),
  success_metrics: jsonb('success_metrics'),
  time_of_day: text('time_of_day'),
  triggers: jsonb('triggers'),
  frequency: integer('frequency'),
  reminder_times: jsonb('reminder_times'),

  // Thirty day challenge fields
  theme: text('theme'),
  custom_theme: text('custom_theme'),
  mini_goals: jsonb('mini_goals'),
  enable_reminders: boolean('enable_reminders'),

  // Replacement challenge fields
  habit_to_quit: text('habit_to_quit'),
  custom_habit: text('custom_habit'),
  main_motivation: text('main_motivation'),
  custom_motivation: text('custom_motivation'),
  streak_goal: text('streak_goal'),
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  user: one(users, {
    fields: [challenges.user_id],
    references: [users.id],
  }),
  progressLogs: many(progressLogs),
}));
