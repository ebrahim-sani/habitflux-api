import { relations } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.schema';

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  body: text('body').notNull(),
  sent_at: timestamp('sent_at', { withTimezone: true })
    .default(sql`TIMEZONE('utc'::text, NOW())`)
    .notNull(),
  sent_by: text('sent_by').references(() => users.id, { onDelete: 'set null' }),
  read_at: timestamp('read_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true })
    .default(sql`TIMEZONE('utc'::text, NOW())`)
    .notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.user_id],
    references: [users.id],
    relationName: 'recipient',
  }),
  sender: one(users, {
    fields: [notifications.sent_by],
    references: [users.id],
    relationName: 'sender',
  }),
}));
