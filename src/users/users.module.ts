import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FcmModule } from '../fcm/fcm.module';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [FcmModule, DrizzleModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
