import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsNumber,
  IsObject,
  IsBoolean,
  IsArray,
  ValidateIf,
} from 'class-validator';

export enum ChallengeType {
  NIGHTY = 'ninety',
  THIRTY = 'thirty',
  REPLACEMENT = 'replacement',
}

export class CreateChallengeDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsNotEmpty()
  @IsEnum(ChallengeType)
  challenge_type: ChallengeType;

  // Common optional fields
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  // Ninety day challenge fields
  @ValidateIf((o) => o.challenge_type === ChallengeType.NIGHTY)
  @IsOptional()
  @IsString()
  habit?: string;

  @ValidateIf((o) => o.challenge_type === ChallengeType.NIGHTY)
  @IsOptional()
  @IsString()
  goal?: string;

  @ValidateIf((o) => o.challenge_type === ChallengeType.NIGHTY)
  @IsOptional()
  @IsObject()
  success_metrics?: Record<string, any>;

  @ValidateIf((o) => o.challenge_type === ChallengeType.NIGHTY)
  @IsOptional()
  @IsString()
  time_of_day?: string;

  @ValidateIf((o) => o.challenge_type === ChallengeType.NIGHTY)
  @IsOptional()
  @IsArray()
  triggers?: string[];

  @ValidateIf((o) => o.challenge_type === ChallengeType.NIGHTY)
  @IsOptional()
  @IsNumber()
  frequency?: number;

  // Fields used by both challenge types
  @IsOptional()
  @IsArray()
  reminder_times?: string[];

  // Thirty day challenge fields
  @ValidateIf((o) => o.challenge_type === ChallengeType.THIRTY)
  @IsOptional()
  @IsString()
  theme?: string;

  @ValidateIf((o) => o.challenge_type === ChallengeType.THIRTY)
  @IsOptional()
  @IsString()
  custom_theme?: string;

  @ValidateIf((o) => o.challenge_type === ChallengeType.THIRTY)
  @IsOptional()
  @IsArray()
  mini_goals?: string[];

  @ValidateIf(
    (o) =>
      o.challenge_type === ChallengeType.THIRTY ||
      o.challenge_type === ChallengeType.REPLACEMENT,
  )
  @IsOptional()
  @IsBoolean()
  enable_reminders?: boolean;

  // Replacement challenge fields
  @ValidateIf((o) => o.challenge_type === ChallengeType.REPLACEMENT)
  @IsOptional()
  @IsString()
  habit_to_quit?: string;

  @ValidateIf((o) => o.challenge_type === ChallengeType.REPLACEMENT)
  @IsOptional()
  @IsString()
  custom_habit?: string;

  @ValidateIf((o) => o.challenge_type === ChallengeType.REPLACEMENT)
  @IsOptional()
  @IsString()
  main_motivation?: string;

  @ValidateIf((o) => o.challenge_type === ChallengeType.REPLACEMENT)
  @IsOptional()
  @IsString()
  custom_motivation?: string;

  @ValidateIf((o) => o.challenge_type === ChallengeType.REPLACEMENT)
  @IsOptional()
  @IsString()
  streak_goal?: string;

  // For frontend compatibility - camelCase versions
  @ValidateIf((o) => o.challenge_type === ChallengeType.REPLACEMENT)
  @IsOptional()
  @IsString()
  habitToQuit?: string;

  @ValidateIf((o) => o.challenge_type === ChallengeType.REPLACEMENT)
  @IsOptional()
  @IsString()
  mainMotivation?: string;

  @ValidateIf((o) => o.challenge_type === ChallengeType.REPLACEMENT)
  @IsOptional()
  @IsString()
  streakGoal?: string;

  // For frontend compatibility
  // @IsOptional()
  // @IsString()
  // challenge_type?: string;
}
