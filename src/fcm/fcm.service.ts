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
    try {
      // Try multiple possible paths to find the service account file
      let serviceAccountPath;
      const possiblePaths = [
        join(__dirname, '../config/firebase-service-account.json'),
        join(__dirname, '../../config/firebase-service-account.json'),
        join(__dirname, '../../../config/firebase-service-account.json'),
        join(process.cwd(), 'src/config/firebase-service-account.json'),
        join(process.cwd(), 'dist/config/firebase-service-account.json'),
      ];

      for (const path of possiblePaths) {
        try {
          readFileSync(path, 'utf8');
          serviceAccountPath = path;
          // console.log(`Found Firebase service account at: ${path}`);
          break;
        } catch (err) {
          // Continue to next path
        }
      }

      if (!serviceAccountPath) {
        throw new Error('Firebase service account file not found');
      }

      admin.initializeApp({
        credential: admin.credential.cert(
          JSON.parse(readFileSync(serviceAccountPath, 'utf8')),
        ),
      });
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      throw error;
    }
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
