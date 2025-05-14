// src/notifications.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { MessagingPayload } from 'firebase-admin/lib/messaging';
import { FcmService } from '../fcm/fcm.service';

class SendDto {
  /** device token or topic */
  target: string;
  /** "device" | "topic" */
  type: 'device' | 'topic';
  /** notification body and title */
  notification: { title: string; body: string };
  /** optional data payload */
  data?: { [key: string]: string };
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly fcm: FcmService) {}

  @Post()
  async send(@Body() dto: SendDto) {
    const payload: MessagingPayload = {
      notification: dto.notification,
      data: dto.data || {},
    };

    if (dto.type === 'device') {
      return this.fcm.sendToDevice(dto.target, payload);
    } else {
      return this.fcm.sendToTopic(dto.target, payload);
    }
  }
}
