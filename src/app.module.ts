import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ChallengeModule } from './challenge/challenge.module';
import { ProgressModule } from './progress/progress.module';
import { NotificationModule } from './notification/notification.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { DrizzleModule } from './drizzle/drizzle.module';
import { FcmModule } from './fcm/fcm.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
    DrizzleModule,
    UsersModule,
    ChallengeModule,
    ProgressModule,
    NotificationModule,
    FcmModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
