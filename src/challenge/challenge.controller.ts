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
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { JwtGuard } from '../auth/guard';
import { GetUserId } from '../auth/decorator';

@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @UseGuards(JwtGuard)
  @Get()
  async findAll(@GetUserId() userId: string) {
    if (userId) {
      return this.challengeService.findByUser(userId);
    }
    return this.challengeService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const challenge = (await this.challengeService.findOne(id)) as {
      user_id: string;
    };
    if (!challenge) {
      throw new HttpException('Challenge not found', HttpStatus.NOT_FOUND);
    }
    return challenge;
  }

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Body() createChallengeDto: CreateChallengeDto,
    @GetUserId() userId: string,
  ) {
    return this.challengeService.create(createChallengeDto, userId);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
    @GetUserId() userId: string,
  ) {
    const challenge = (await this.challengeService.findOne(id)) as {
      user_id: string;
    };
    if (!challenge) {
      throw new HttpException('Challenge not found', HttpStatus.NOT_FOUND);
    }

    if (challenge.user_id !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    return this.challengeService.update(id, updateChallengeDto);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @GetUserId() userId: string) {
    const challenge = (await this.challengeService.findOne(id)) as {
      user_id: string;
    };
    if (!challenge) {
      throw new HttpException('Challenge not found', HttpStatus.NOT_FOUND);
    }

    if (challenge.user_id !== userId) {
      throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    return this.challengeService.remove(id);
  }
}
