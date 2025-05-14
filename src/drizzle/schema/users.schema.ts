import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { challenges } from './challenge.schema';
import { notifications } from './notification.schema';

export const users = pgTable('users', {
  id: text('id').primaryKey().notNull(),
  email: text('email').notNull(),
  full_name: text('full_name').notNull(),
  created_at: timestamp('created_at', { withTimezone: true })
    .default(sql`TIMEZONE('utc'::text, NOW())`)
    .notNull(),
  fcm_token: text('fcm_token'),
  timezone: text('timezone').default('UTC').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  challenges: many(challenges),
  receivedNotifications: many(notifications, { relationName: 'recipient' }),
  sentNotifications: many(notifications, { relationName: 'sender' }),
}));
