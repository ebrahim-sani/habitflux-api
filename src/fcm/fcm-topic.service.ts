import { Injectable } from '@nestjs/common';
import { getMessaging } from 'firebase-admin/messaging';

@Injectable()
export class FcmTopicService {
  /**
   * Generate a topic name based on challenge type and timezone
   */
  getTopicName(challengeType: string, timezone: string): string {
    // Convert timezone to a valid topic name (remove special chars)
    const safeTimezone = timezone.replace(/[^a-zA-Z0-9_]/g, '_');
    return `${challengeType}_${safeTimezone}`;
  }

  /**
   * Subscribe a device to a topic
   */
  async subscribeToTopic(token: string, challengeType: string, timezone: string): Promise<void> {
    const topicName = this.getTopicName(challengeType, timezone);
    await getMessaging().subscribeToTopic(token, topicName);
  }

  /**
   * Unsubscribe a device from a topic
   */
  async unsubscribeFromTopic(token: string, challengeType: string, timezone: string): Promise<void> {
    const topicName = this.getTopicName(challengeType, timezone);
    await getMessaging().unsubscribeFromTopic(token, topicName);
  }

  /**
   * Subscribe a device to all challenge type topics for a timezone
   */
  async subscribeToAllTopics(token: string, timezone: string): Promise<void> {
    const challengeTypes = ['ninety', 'thirty', 'replacement'];
    await Promise.all(
      challengeTypes.map(type => this.subscribeToTopic(token, type, timezone))
    );
  }
}