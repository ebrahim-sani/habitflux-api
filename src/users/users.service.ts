import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { users } from '../drizzle/schema/users.schema';
import { DrizzleDB } from '../drizzle/types/drizzle';
import { FcmTopicService } from '../fcm/fcm-topic.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private fcmTopicService: FcmTopicService,
  ) {}

  async findAll() {
    const cacheKey = 'all_users';
    const cachedUsers = await this.cacheManager.get(cacheKey);

    if (cachedUsers) {
      return cachedUsers;
    }

    const result = await this.db.select().from(users);
    await this.cacheManager.set(cacheKey, result, 60000); // Cache for 1 minute
    return result;
  }

  async findOne(id: string) {
    const cacheKey = `user_${id}`;
    const cachedUser = await this.cacheManager.get(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const result = await this.db.select().from(users).where(eq(users.id, id));
    if (result.length > 0) {
      await this.cacheManager.set(cacheKey, result[0], 60000); // Cache for 1 minute
      return result[0];
    }
    return null;
  }

  async create(data: any, userId: string) {
    const result = await this.db
      .insert(users)
      .values({
        ...data,
        id: userId,
        timezone: data.timezone || 'UTC',
      })
      .returning();

    if (data.fcm_token) {
      await this.fcmTopicService.subscribeToAllTopics(
        data.fcm_token,
        data.timezone || 'UTC',
      );
    }

    await this.cacheManager.del('all_users');
    return result[0];
  }

  async update(id: string, data: any) {
    const user = (await this.findOne(id)) as {
      fcm_token?: string;
      timezone?: string;
    } | null;
    const result = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();

    if (user && result[0]) {
      const oldToken = user.fcm_token;
      const newToken = data.fcm_token;
      const oldTimezone = user.timezone || 'UTC';
      const newTimezone = data.timezone || oldTimezone;

      if (newToken && newToken !== oldToken) {
        await this.fcmTopicService.subscribeToAllTopics(newToken, newTimezone);
      }

      if (newTimezone !== oldTimezone && oldToken) {
        await this.fcmTopicService.subscribeToAllTopics(oldToken, oldTimezone);
        await this.fcmTopicService.subscribeToAllTopics(oldToken, newTimezone);
      }
    }

    await this.cacheManager.del(`user_${id}`);
    await this.cacheManager.del('all_users');
    return result[0];
  }

  async remove(id: string) {
    const result = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();
    await this.cacheManager.del(`user_${id}`);
    await this.cacheManager.del('all_users');
    return result[0];
  }
}
