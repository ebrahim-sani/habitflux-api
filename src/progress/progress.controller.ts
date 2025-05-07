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
  BadRequestException,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtGuard } from '../auth/guard';
import { GetUserId } from '../auth/decorator';
import { isUUID } from 'class-validator';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @UseGuards(JwtGuard)
  @Get()
  async findAll(@Query('challengeId') challengeId: string) {
    if (challengeId) {
      return this.progressService.findByChallenge(challengeId);
    }
    return [];
  }

  @UseGuards(JwtGuard)
  @Get('challenge/:challengeId')
  async findByChallengeId(@Param('challengeId') challengeId: string) {
    if (!challengeId || !isUUID(challengeId)) {
      throw new BadRequestException('Invalid challenge ID format');
    }

    return this.progressService.findByChallenge(challengeId);
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const progress = await this.progressService.findOne(id);
    if (!progress) {
      return [];
    }
    return progress;
  }

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Body() createProgressDto: CreateProgressDto,
    @GetUserId() userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.progressService.create(createProgressDto, userId);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    const progress = await this.progressService.findOne(id);
    if (!progress) {
      throw new HttpException('Progress log not found', HttpStatus.NOT_FOUND);
    }
    return this.progressService.update(id, updateProgressDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const progress = await this.progressService.findOne(id);
    if (!progress) {
      throw new HttpException('Progress log not found', HttpStatus.NOT_FOUND);
    }
    return this.progressService.remove(id);
  }
}
