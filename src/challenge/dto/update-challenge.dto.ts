import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsObject,
  IsBoolean,
  IsArray,
  ValidateIf,
} from 'class-validator';
import { ChallengeType } from './create-challenge.dto';

export class UpdateChallengeDto {
  @IsOptional()
  @IsEnum(ChallengeType)
  challenge_type?: ChallengeType;

  // Common optional fields
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  // Ninety day challenge fields
  @ValidateIf((o) => o.type === ChallengeType.NIGHTY || !o.type)
  @IsOptional()
  @IsString()
  habit?: string;

  @ValidateIf((o) => o.type === ChallengeType.NIGHTY || !o.type)
  @IsOptional()
  @IsString()
  goal?: string;

  @ValidateIf((o) => o.type === ChallengeType.NIGHTY || !o.type)
  @IsOptional()
  @IsObject()
  success_metrics?: Record<string, any>;

  @ValidateIf((o) => o.type === ChallengeType.NIGHTY || !o.type)
  @IsOptional()
  @IsString()
  time_of_day?: string;

  @ValidateIf((o) => o.type === ChallengeType.NIGHTY || !o.type)
  @IsOptional()
  @IsArray()
  triggers?: string[];

  @ValidateIf((o) => o.type === ChallengeType.NIGHTY || !o.type)
  @IsOptional()
  @IsNumber()
  frequency?: number;

  // Fields used by both challenge types
  @IsOptional()
  @IsArray()
  reminder_times?: string[];

  // Thirty day challenge fields
  @ValidateIf((o) => o.type === ChallengeType.THIRTY || !o.type)
  @IsOptional()
  @IsString()
  theme?: string;

  @ValidateIf((o) => o.type === ChallengeType.THIRTY || !o.type)
  @IsOptional()
  @IsString()
  custom_theme?: string;

  @ValidateIf((o) => o.type === ChallengeType.THIRTY || !o.type)
  @IsOptional()
  @IsArray()
  mini_goals?: string[];

  @ValidateIf(
    (o) =>
      o.type === ChallengeType.THIRTY ||
      o.type === ChallengeType.REPLACEMENT ||
      !o.type,
  )
  @IsOptional()
  @IsBoolean()
  enable_reminders?: boolean;

  // Replacement challenge fields
  @ValidateIf((o) => o.type === ChallengeType.REPLACEMENT || !o.type)
  @IsOptional()
  @IsString()
  habit_to_quit?: string;

  @ValidateIf((o) => o.type === ChallengeType.REPLACEMENT || !o.type)
  @IsOptional()
  @IsString()
  custom_habit?: string;

  @ValidateIf((o) => o.type === ChallengeType.REPLACEMENT || !o.type)
  @IsOptional()
  @IsString()
  main_motivation?: string;

  @ValidateIf((o) => o.type === ChallengeType.REPLACEMENT || !o.type)
  @IsOptional()
  @IsString()
  custom_motivation?: string;

  @ValidateIf((o) => o.type === ChallengeType.REPLACEMENT || !o.type)
  @IsOptional()
  @IsString()
  streak_goal?: string;

  // For frontend compatibility - camelCase versions
  @ValidateIf((o) => o.type === ChallengeType.REPLACEMENT || !o.type)
  @IsOptional()
  @IsString()
  habitToQuit?: string;

  @ValidateIf((o) => o.type === ChallengeType.REPLACEMENT || !o.type)
  @IsOptional()
  @IsString()
  mainMotivation?: string;

  @ValidateIf((o) => o.type === ChallengeType.REPLACEMENT || !o.type)
  @IsOptional()
  @IsString()
  streakGoal?: string;
}
