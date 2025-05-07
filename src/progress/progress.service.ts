import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { progressLogs } from '../drizzle/schema/progress.schema';
import { DrizzleDB } from '../drizzle/types/drizzle';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { isUUID } from 'class-validator';
import { challenges } from 'src/drizzle/schema/challenge.schema';

@Injectable()
export class ProgressService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    const cacheKey = 'all_progress_logs';
    const cachedLogs = await this.cacheManager.get(cacheKey);

    if (cachedLogs) {
      return cachedLogs;
    }

    const result = await this.db.select().from(progressLogs);
    await this.cacheManager.set(cacheKey, result, 60000); // Cache for 1 minute
    return result;
  }

  async findByChallenge(challengeId: string) {
    if (!isUUID(challengeId)) {
      throw new BadRequestException('Invalid challenge ID format');
    }

    const cacheKey = `challenge_${challengeId}_progress`;
    const cachedLogs = await this.cacheManager.get(cacheKey);

    if (cachedLogs) {
      return cachedLogs;
    }

    const challenge = await this.db
      .select()
      .from(challenges)
      .where(eq(challenges.id, challengeId));

    if (challenge.length === 0) {
      throw new BadRequestException('Challenge not found');
    }

    const result = await this.db
      .select()
      .from(progressLogs)
      .where(eq(progressLogs.challenge_id, challengeId))
      .orderBy(progressLogs.date);

    await this.cacheManager.set(cacheKey, result, 60000); // Cache for 1 minute
    return result;
  }

  async findOne(id: string) {
    const cacheKey = `progress_${id}`;
    const cachedLog = await this.cacheManager.get(cacheKey);

    if (cachedLog) {
      return cachedLog;
    }

    const result = await this.db
      .select()
      .from(progressLogs)
      .where(eq(progressLogs.id, id));
    if (result.length > 0) {
      await this.cacheManager.set(cacheKey, result[0], 60000); // Cache for 1 minute
      return result[0];
    }
    return null;
  }

  async create(createProgressDto: CreateProgressDto, user_id: string) {
    const { challenge_id, progress } = createProgressDto;

    if (!challenge_id || !isUUID(challenge_id)) {
      throw new BadRequestException('Invalid challenge ID format');
    }

    const result = await this.db
      .insert(progressLogs)
      .values({
        user_id,
        challenge_id,
        challenge_type: progress.challenge_type,
        date: new Date(progress.date),
        data: progress.data,
      })
      .returning();

    await this.cacheManager.del('all_progress_logs');
    await this.cacheManager.del(`challenge_${challenge_id}_progress`);
    return result[0];
  }

  async update(id: string, updateProgressDto: UpdateProgressDto) {
    const log = (await this.findOne(id)) as { challenge_id: string } | null;
    if (!log) return null;

    const updateData: any = {};

    if (updateProgressDto.progress) {
      if (updateProgressDto.progress.challenge_type) {
        updateData.type = updateProgressDto.progress.challenge_type;
      }

      if (updateProgressDto.progress.date) {
        updateData.date = new Date(updateProgressDto.progress.date);
      }

      if (updateProgressDto.progress.data) {
        updateData.data = updateProgressDto.progress.data;
      }
    }

    const result = await this.db
      .update(progressLogs)
      .set(updateData)
      .where(eq(progressLogs.id, id))
      .returning();

    await this.cacheManager.del(`progress_${id}`);
    await this.cacheManager.del('all_progress_logs');
    await this.cacheManager.del(`challenge_${log.challenge_id}_progress`);

    return result[0];
  }

  async remove(id: string) {
    const log = (await this.findOne(id)) as { challenge_id: string } | null;
    if (!log) return null;

    const result = await this.db
      .delete(progressLogs)
      .where(eq(progressLogs.id, id))
      .returning();

    await this.cacheManager.del(`progress_${id}`);
    await this.cacheManager.del('all_progress_logs');
    await this.cacheManager.del(`challenge_${log.challenge_id}_progress`);

    return result[0];
  }
}
