import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  getMessaging,
  MessagingPayload,
  Message,
} from 'firebase-admin/messaging';

@Injectable()
export class FcmService implements OnModuleInit {
  onModuleInit() {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(
          readFileSync(
            join(__dirname, '../config/firebase-service-account.json'),
            'utf8',
          ),
        ),
      ),
    });
  }

  /**
   * Send a notification to a single device
   */
  async sendToDevice(token: string, payload: MessagingPayload) {
    const message: Message = {
      token,
      notification: payload.notification,
      data: payload.data,
    };
    return getMessaging().send(message);
  }

  /**
   * Send a notification to a topic
   */
  async sendToTopic(topic: string, payload: MessagingPayload) {
    const message: Message = {
      topic,
      notification: payload.notification,
      data: payload.data,
    };
    return getMessaging().send(message);
  }

  /**
   * Subscribe a list of device tokens to a topic
   */
  async subscribeToTopic(topic: string, tokens: string[]) {
    return getMessaging().subscribeToTopic(tokens, topic);
  }

  /**
   * Unsubscribe tokens from a topic
   */
  async unsubscribeFromTopic(topic: string, tokens: string[]) {
    return getMessaging().unsubscribeFromTopic(tokens, topic);
  }
}
