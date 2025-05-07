import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { eq } from 'drizzle-orm';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { challenges } from '../drizzle/schema/challenge.schema';
import { DrizzleDB } from '../drizzle/types/drizzle';
import { CreateChallengeDto, ChallengeType } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';

@Injectable()
export class ChallengeService {
  constructor(
    @Inject(DRIZZLE) private db: DrizzleDB,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    const cacheKey = 'all_challenges';
    const cachedChallenges = await this.cacheManager.get(cacheKey);

    if (cachedChallenges) {
      return cachedChallenges;
    }

    const result = await this.db.select().from(challenges);
    await this.cacheManager.set(cacheKey, result, 60000); // Cache for 1 minute
    return result;
  }

  async findByUser(userId: string) {
    const cacheKey = `user_${userId}_challenges`;
    const cachedChallenges = await this.cacheManager.get(cacheKey);

    if (cachedChallenges) {
      return cachedChallenges;
    }

    const result = await this.db
      .select()
      .from(challenges)
      .where(eq(challenges.user_id, userId));
    await this.cacheManager.set(cacheKey, result, 60000); // Cache for 1 minute
    return result;
  }

  async findOne(id: string) {
    const cacheKey = `challenge_${id}`;
    const cachedChallenge = await this.cacheManager.get(cacheKey);

    if (cachedChallenge) {
      return cachedChallenge;
    }

    const result = await this.db
      .select()
      .from(challenges)
      .where(eq(challenges.id, id));
    if (result.length > 0) {
      await this.cacheManager.set(cacheKey, result[0], 60000); // Cache for 1 minute
      return result[0];
    }
    return null;
  }

  async create(createChallengeDto: CreateChallengeDto, userId: string) {
    // Ensure challenge_type is set
    if (!createChallengeDto.challenge_type) {
      throw new BadRequestException('Challenge type is required');
    }

    // Prepare data based on challenge type
    const insertData: any = {
      user_id: userId,
      challenge_type: createChallengeDto.challenge_type,
    };

    // Add common fields
    if (createChallengeDto.data) {
      insertData.data = createChallengeDto.data;
    }

    // Add type-specific fields
    if (createChallengeDto.challenge_type === ChallengeType.NIGHTY) {
      if (createChallengeDto.habit) insertData.habit = createChallengeDto.habit;
      if (createChallengeDto.goal) insertData.goal = createChallengeDto.goal;
      if (createChallengeDto.success_metrics)
        insertData.success_metrics = createChallengeDto.success_metrics;
      if (createChallengeDto.time_of_day)
        insertData.time_of_day = createChallengeDto.time_of_day;
      if (createChallengeDto.triggers)
        insertData.triggers = createChallengeDto.triggers;
      if (createChallengeDto.frequency)
        insertData.frequency = createChallengeDto.frequency;
      if (createChallengeDto.reminder_times)
        insertData.reminder_times = createChallengeDto.reminder_times;
    } else if (createChallengeDto.challenge_type === ChallengeType.THIRTY) {
      if (createChallengeDto.theme) insertData.theme = createChallengeDto.theme;
      if (createChallengeDto.custom_theme)
        insertData.custom_theme = createChallengeDto.custom_theme;
      if (createChallengeDto.mini_goals)
        insertData.mini_goals = createChallengeDto.mini_goals;
      if (createChallengeDto.enable_reminders !== undefined)
        insertData.enable_reminders = createChallengeDto.enable_reminders;
      if (createChallengeDto.reminder_times)
        insertData.reminder_times = createChallengeDto.reminder_times;
    } else if (
      createChallengeDto.challenge_type === ChallengeType.REPLACEMENT
    ) {
      // Handle both snake_case and camelCase versions from frontend
      if (createChallengeDto.habit_to_quit || createChallengeDto.habitToQuit)
        insertData.habit_to_quit =
          createChallengeDto.habit_to_quit || createChallengeDto.habitToQuit;

      if (createChallengeDto.custom_habit)
        insertData.custom_habit = createChallengeDto.custom_habit;

      if (
        createChallengeDto.main_motivation ||
        createChallengeDto.mainMotivation
      )
        insertData.main_motivation =
          createChallengeDto.main_motivation ||
          createChallengeDto.mainMotivation;

      if (createChallengeDto.custom_motivation)
        insertData.custom_motivation = createChallengeDto.custom_motivation;

      if (createChallengeDto.streak_goal || createChallengeDto.streakGoal)
        insertData.streak_goal =
          createChallengeDto.streak_goal || createChallengeDto.streakGoal;

      if (createChallengeDto.enable_reminders !== undefined)
        insertData.enable_reminders = createChallengeDto.enable_reminders;

      if (createChallengeDto.reminder_times)
        insertData.reminder_times = createChallengeDto.reminder_times;
    }

    const result = await this.db
      .insert(challenges)
      .values(insertData)
      .returning();

    await this.cacheManager.del('all_challenges');
    await this.cacheManager.del(`user_${userId}_challenges`);

    return result[0];
  }

  async update(id: string, updateChallengeDto: UpdateChallengeDto) {
    const challenge = await this.findOne(id);
    if (!challenge) {
      return null;
    }

    // Prepare update data
    const updateData: any = {};

    // Add common fields
    if (updateChallengeDto.challenge_type)
      updateData.challenge_type = updateChallengeDto.challenge_type;
    if (updateChallengeDto.data) updateData.data = updateChallengeDto.data;

    // Add type-specific fields based on the challenge's current type or updated type
    const challengeType =
      updateChallengeDto.challenge_type ||
      (challenge as { challenge_type: ChallengeType }).challenge_type;

    if (challengeType === ChallengeType.NIGHTY) {
      if (updateChallengeDto.habit !== undefined)
        updateData.habit = updateChallengeDto.habit;
      if (updateChallengeDto.goal !== undefined)
        updateData.goal = updateChallengeDto.goal;
      if (updateChallengeDto.success_metrics !== undefined)
        updateData.success_metrics = updateChallengeDto.success_metrics;
      if (updateChallengeDto.time_of_day !== undefined)
        updateData.time_of_day = updateChallengeDto.time_of_day;
      if (updateChallengeDto.triggers !== undefined)
        updateData.triggers = updateChallengeDto.triggers;
      if (updateChallengeDto.frequency !== undefined)
        updateData.frequency = updateChallengeDto.frequency;
      if (updateChallengeDto.reminder_times !== undefined)
        updateData.reminder_times = updateChallengeDto.reminder_times;
    } else if (challengeType === ChallengeType.THIRTY) {
      if (updateChallengeDto.theme !== undefined)
        updateData.theme = updateChallengeDto.theme;
      if (updateChallengeDto.custom_theme !== undefined)
        updateData.custom_theme = updateChallengeDto.custom_theme;
      if (updateChallengeDto.mini_goals !== undefined)
        updateData.mini_goals = updateChallengeDto.mini_goals;
      if (updateChallengeDto.enable_reminders !== undefined)
        updateData.enable_reminders = updateChallengeDto.enable_reminders;
      if (updateChallengeDto.reminder_times !== undefined)
        updateData.reminder_times = updateChallengeDto.reminder_times;
    } else if (challengeType === ChallengeType.REPLACEMENT) {
      // Handle both snake_case and camelCase versions from frontend
      if (
        updateChallengeDto.habit_to_quit !== undefined ||
        updateChallengeDto.habitToQuit !== undefined
      )
        updateData.habit_to_quit =
          updateChallengeDto.habit_to_quit || updateChallengeDto.habitToQuit;

      if (updateChallengeDto.custom_habit !== undefined)
        updateData.custom_habit = updateChallengeDto.custom_habit;

      if (
        updateChallengeDto.main_motivation !== undefined ||
        updateChallengeDto.mainMotivation !== undefined
      )
        updateData.main_motivation =
          updateChallengeDto.main_motivation ||
          updateChallengeDto.mainMotivation;

      if (updateChallengeDto.custom_motivation !== undefined)
        updateData.custom_motivation = updateChallengeDto.custom_motivation;

      if (
        updateChallengeDto.streak_goal !== undefined ||
        updateChallengeDto.streakGoal !== undefined
      )
        updateData.streak_goal =
          updateChallengeDto.streak_goal || updateChallengeDto.streakGoal;

      if (updateChallengeDto.enable_reminders !== undefined)
        updateData.enable_reminders = updateChallengeDto.enable_reminders;

      if (updateChallengeDto.reminder_times !== undefined)
        updateData.reminder_times = updateChallengeDto.reminder_times;
    }

    const result = await this.db
      .update(challenges)
      .set(updateData)
      .where(eq(challenges.id, id))
      .returning();

    await this.cacheManager.del(`challenge_${id}`);
    await this.cacheManager.del('all_challenges');
    await this.cacheManager.del(
      `user_${(challenge as { user_id: string }).user_id}_challenges`,
    );

    return result[0];
  }
  // Removed redundant line causing 'await' error
  async remove(id: string) {
    const challenge = (await this.findOne(id)) as { user_id: string };
    if (!challenge) return null;

    const result = await this.db
      .delete(challenges)
      .where(eq(challenges.id, id))
      .returning();

    await this.cacheManager.del(`challenge_${id}`);
    await this.cacheManager.del('all_challenges');
    await this.cacheManager.del(`user_${challenge.user_id}_challenges`);

    return result[0];
  }
}
