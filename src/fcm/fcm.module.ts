import { Module } from '@nestjs/common';
import { FcmController } from './fcm.controller';
import { FcmService } from './fcm.service';
import { FcmTopicService } from './fcm-topic.service';

@Module({
  controllers: [FcmController],
  providers: [FcmService, FcmTopicService],
  exports: [FcmService, FcmTopicService],
})
export class FcmModule {}
