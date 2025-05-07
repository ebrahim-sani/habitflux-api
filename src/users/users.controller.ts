import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from '../auth/guard';
import { GetUserId } from '../auth/decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get('me')
  async findOne(@GetUserId() userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @UseGuards(JwtGuard)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @GetUserId() userId: string,
  ) {
    return this.usersService.create(createUserDto, userId);
  }

  @UseGuards(JwtGuard)
  @Patch('update')
  async update(@GetUserId() id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtGuard)
  @Delete('delete')
  async remove(@GetUserId() id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.usersService.remove(id);
  }
}
