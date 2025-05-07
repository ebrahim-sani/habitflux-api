import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtGuard } from '../auth/guard';
import { GetUserId } from '../auth/decorator';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtGuard)
  @Get()
  async findAll(
    @Query('userId') queryUserId?: string,
    @GetUserId() currentUserId?: string,
  ) {
    // If userId is provided in query and it matches the current user, use that
    // Otherwise, default to the current user's notifications
    const userId = queryUserId === currentUserId ? queryUserId : currentUserId;
    return this.notificationService.findByUser(userId);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @GetUserId() userId: string) {
    const notification = (await this.notificationService.findOne(id)) as {
      user_id: string;
    };
    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }

    // Verify the notification belongs to the user
    if (notification.user_id !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    return notification;
  }

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @GetUserId() userId: string,
  ) {
    // Use the authenticated user's ID if not provided in the DTO
    if (!createNotificationDto.user_id) {
      createNotificationDto.user_id = userId;
    } else if (createNotificationDto.user_id !== userId) {
      // Users can only create notifications for themselves
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    return this.notificationService.create(createNotificationDto);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @GetUserId() userId: string,
  ) {
    const notification = (await this.notificationService.findOne(id)) as {
      user_id: string;
    };
    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }

    // Verify the notification belongs to the user
    if (notification.user_id !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    return this.notificationService.update(id, updateNotificationDto);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @GetUserId() userId: string) {
    const notification = (await this.notificationService.findOne(id)) as {
      user_id: string;
    };
    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }

    // Verify the notification belongs to the user
    if (notification.user_id !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    return this.notificationService.markAsRead(id);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUserId() userId: string) {
    const notification = (await this.notificationService.findOne(id)) as {
      user_id: string;
    };
    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }

    // Verify the notification belongs to the user
    if (notification.user_id !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    return this.notificationService.remove(id);
  }
}
