import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FcmService } from '../fcm/fcm.service';
import { FcmTopicService } from '../fcm/fcm-topic.service';
import { MessagingPayload } from 'firebase-admin/lib/messaging';
import { DRIZZLE } from '../drizzle/drizzle.module';
import { Inject } from '@nestjs/common';
import { DrizzleDB } from '../drizzle/types/drizzle';
import { eq, and } from 'drizzle-orm';
import { challenges } from '../drizzle/schema/challenge.schema';
import { users } from '../drizzle/schema/users.schema';
import { allTimezones } from '../constant/timezones';

@Injectable()
export class ScheduledNotificationsService {
  constructor(
    private readonly fcmService: FcmService,
    private readonly fcmTopicService: FcmTopicService,
    @Inject(DRIZZLE) private db: DrizzleDB,
  ) {}

  /**
   * Get all timezones that are currently at a specific hour and minute
   */
  private getTimezonesWithTime(hour: number, minute: number): string[] {
    const now = new Date();
    const timezones: string[] = [];

    for (const tz of allTimezones) {
      try {
        const tzTime = new Date(now.toLocaleString('en-US', { timeZone: tz }));
        if (tzTime.getHours() === hour && tzTime.getMinutes() === minute) {
          timezones.push(tz);
        }
      } catch (error) {
        // Skip invalid timezones
        console.error(`Invalid timezone: ${tz}`);
      }
    }

    return timezones;
  }

  /**
   * Send morning notifications to all challenge types in timezones where it's 6:30 AM
   * Runs every minute to check for timezones where it's 6:30 AM
   */
  @Cron('0 * * * * *')
  async sendMorningNotifications() {
    const timezones = this.getTimezonesWithTime(6, 30);
    const challengeTypes = ['ninety', 'thirty', 'replacement'];

    for (const timezone of timezones) {
      for (const type of challengeTypes) {
        const topicName = this.fcmTopicService.getTopicName(type, timezone);

        let title, body;
        switch (type) {
          case 'ninety':
            title = '90-Day Challenge';
            body = 'Time to work on your 90-day challenge habit!';
            break;
          case 'thirty':
            title = '30-Day Challenge';
            body = 'Keep up with your 30-day challenge today!';
            break;
          case 'replacement':
            title = 'Habit Replacement';
            body =
              'Remember to replace your old habit with your new one today!';
            break;
        }

        const payload: MessagingPayload = {
          notification: { title, body },
          data: { type, timestamp: new Date().toISOString() },
        };

        await this.fcmService.sendToTopic(topicName, payload);
      }
    }
  }

  /**
   * Send daily log reminders to all users in timezones where it's 8:00 PM
   * Runs every minute to check for timezones where it's 8:00 PM
   */
  @Cron('0 * * * * *')
  async sendDailyLogReminders() {
    const timezones = this.getTimezonesWithTime(20, 0); // 8:00 PM

    for (const timezone of timezones) {
      // Get all users in this timezone
      const usersInTimezone = await this.db
        .select()
        .from(users)
        .where(eq(users.timezone, timezone));

      for (const user of usersInTimezone) {
        if (user.fcm_token) {
          const payload: MessagingPayload = {
            notification: {
              title: 'Daily Log Reminder',
              body: "Don't forget to log your progress for today!",
            },
            data: {
              type: 'daily_log',
              timestamp: new Date().toISOString(),
            },
          };

          await this.fcmService.sendToDevice(user.fcm_token, payload);
        }
      }
    }
  }

  /**
   * Map time of day to hour
   */
  private getHourForTimeOfDay(timeOfDay: string): number {
    switch (timeOfDay.toLowerCase()) {
      case 'morning':
        return 8; // 8:00 AM
      case 'afternoon':
        return 13; // 1:00 PM
      case 'evening':
        return 18; // 6:00 PM
      case 'night':
        return 21; // 9:00 PM
      default:
        return 8; // Default to morning
    }
  }

  /**
   * Send user-specific reminders based on their reminder_times
   * Runs every minute to check for users who need reminders
   */
  @Cron('0 * * * * *')
  async sendUserSpecificReminders() {
    const now = new Date();
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();

    // Only run at the top of each hour (when minute is 0)
    if (minute !== 0) {
      return;
    }

    // Get all active challenges with reminders enabled
    const activeReminders = await this.db
      .select({
        challenge: challenges,
        user: users,
      })
      .from(challenges)
      .leftJoin(users, eq(challenges.user_id, users.id))
      .where(
        and(
          eq(challenges.completed, false),
          eq(challenges.enable_reminders, true),
        ),
      );

    for (const { challenge, user } of activeReminders) {
      if (!user.fcm_token || !challenge.reminder_times) {
        continue;
      }

      // Convert reminder_times from JSON to array if needed
      const reminderTimes = Array.isArray(challenge.reminder_times)
        ? challenge.reminder_times
        : JSON.parse(challenge.reminder_times as string);

      // Get the current hour in the user's timezone
      const userTime = new Date(
        now.toLocaleString('en-US', { timeZone: user.timezone }),
      );
      const userHour = userTime.getHours();

      // Check if any reminder time matches the current hour in the user's timezone
      for (const timeOfDay of reminderTimes) {
        const reminderHour = this.getHourForTimeOfDay(timeOfDay);

        if (userHour === reminderHour) {
          let title, body;

          switch (challenge.challenge_type) {
            case 'ninety':
              title = '90-Day Challenge Reminder';
              body = `Time for your ${challenge.habit} habit!`;
              break;
            case 'thirty':
              title = '30-Day Challenge Reminder';
              body = `Don't forget your ${challenge.theme || 'challenge'} today!`;
              break;
            case 'replacement':
              title = 'Habit Replacement Reminder';
              body = `Remember to replace ${challenge.habit_to_quit} with ${challenge.custom_habit}!`;
              break;
            default:
              title = 'Challenge Reminder';
              body = 'Time to work on your challenge!';
          }

          const payload: MessagingPayload = {
            notification: { title, body },
            data: {
              type: 'reminder',
              challenge_id: challenge.id,
              challenge_type: challenge.challenge_type,
              timestamp: new Date().toISOString(),
            },
          };

          await this.fcmService.sendToDevice(user.fcm_token, payload);

          // Only send one reminder per hour, even if multiple times match
          break;
        }
      }
    }
  }
}
