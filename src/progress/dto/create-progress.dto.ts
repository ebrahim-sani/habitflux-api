import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsObject,
  IsDateString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProgressType {
  NIGHTY_CHALLENGE = 'ninety',
  THIRTY_DAY = 'thirty',
  REPLACEMENT = 'replacement',
}

export class ProgressDataDto {
  @IsOptional()
  cravingIntensity?: number;

  @IsOptional()
  replacementMinutes?: number;

  @IsOptional()
  winsCount?: number;

  @IsOptional()
  moodRating?: number;

  @IsOptional()
  engagedInHabit?: boolean | null;

  @IsOptional()
  engagementCount?: number;

  @IsOptional()
  triggers?: string[];

  @IsOptional()
  timeSpent?: number;

  @IsOptional()
  mood?: string | null;

  @IsOptional()
  notes?: string;

  @IsOptional()
  stayedOnTrack?: string[];

  @IsOptional()
  alternativeActivities?: string[];

  @IsOptional()
  motivationLevel?: number;

  @IsOptional()
  date?: Date;

  @IsOptional()
  @IsObject()
  additionalData?: Record<string, any>;
}

export class ProgressPayloadDto {
  @IsNotEmpty()
  @IsEnum(ProgressType)
  challenge_type: ProgressType;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ProgressDataDto)
  data: ProgressDataDto;
}

export class CreateProgressDto {
  @IsNotEmpty()
  @IsUUID()
  challenge_id: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ProgressPayloadDto)
  progress: ProgressPayloadDto;
}
