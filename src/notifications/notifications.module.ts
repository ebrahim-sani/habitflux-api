import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { FcmModule } from '../fcm/fcm.module';
import { ScheduledNotificationsService } from './scheduled-notifications.service';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [FcmModule, DrizzleModule, ScheduleModule.forRoot()],
  controllers: [NotificationsController],
  providers: [NotificationsService, ScheduledNotificationsService],
})
export class NotificationsModule {}
