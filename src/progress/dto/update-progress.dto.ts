import {
  IsOptional,
  IsObject,
  IsDateString,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProgressDataDto, ProgressType } from './create-progress.dto';

export class UpdateProgressPayloadDto {
  @IsOptional()
  @IsEnum(ProgressType)
  type?: ProgressType;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProgressDataDto)
  data?: ProgressDataDto;
}

export class UpdateProgressDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateProgressPayloadDto)
  progress?: UpdateProgressPayloadDto;
}
