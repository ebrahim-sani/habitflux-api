import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { notifications } from '../drizzle/schema/notification.schema';
import { DrizzleDB } from '../drizzle/types/drizzle';

@Injectable()
export class NotificationService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    const cacheKey = 'all_notifications';
    const cachedNotifications = await this.cacheManager.get(cacheKey);

    if (cachedNotifications) {
      return cachedNotifications;
    }

    const result = await this.db.select().from(notifications);
    await this.cacheManager.set(cacheKey, result, 60000); // Cache for 1 minute
    return result;
  }

  async findByUser(userId: string) {
    const cacheKey = `user_${userId}_notifications`;
    const cachedNotifications = await this.cacheManager.get(cacheKey);

    if (cachedNotifications) {
      return cachedNotifications;
    }

    const result = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.user_id, userId));
    await this.cacheManager.set(cacheKey, result, 60000); // Cache for 1 minute
    return result;
  }

  async findOne(id: string) {
    const cacheKey = `notification_${id}`;
    const cachedNotification = await this.cacheManager.get(cacheKey);

    if (cachedNotification) {
      return cachedNotification;
    }

    const result = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    if (result.length > 0) {
      await this.cacheManager.set(cacheKey, result[0], 60000); // Cache for 1 minute
      return result[0];
    }
    return null;
  }

  async create(data: any) {
    const result = await this.db.insert(notifications).values(data).returning();
    await this.cacheManager.del('all_notifications');
    await this.cacheManager.del(`user_${data.user_id}_notifications`);
    return result[0];
  }

  async update(id: string, data: any) {
    const notification = (await this.findOne(id)) as { user_id: string } | null;
    const result = await this.db
      .update(notifications)
      .set(data)
      .where(eq(notifications.id, id))
      .returning();

    await this.cacheManager.del(`notification_${id}`);
    await this.cacheManager.del('all_notifications');
    await this.cacheManager.del(`user_${notification.user_id}_notifications`);

    return result[0];
  }

  async remove(id: string) {
    const notification = (await this.findOne(id)) as { user_id: string } | null;
    const result = await this.db
      .delete(notifications)
      .where(eq(notifications.id, id))
      .returning();

    await this.cacheManager.del(`notification_${id}`);
    await this.cacheManager.del('all_notifications');
    await this.cacheManager.del(`user_${notification.user_id}_notifications`);

    return result[0];
  }

  async markAsRead(id: string) {
    return this.update(id, {
      read_at: new Date(),
    });
  }
}
