import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Matches } from 'class-validator';
import type { ActivityStatus, ActivityType } from '../activity.entity';

const ACTIVITY_TYPES: ActivityType[] = [
  'opdracht',
  'workshop',
  'competentie',
  'eigen activiteit',
  'challenge',
  'coaching',
  'sprint review',
  'semesterplan',
  'posterpresentatie',
  'overdracht',
];
const ACTIVITY_STATUSES: ActivityStatus[] = ['open', 'bezig', 'feedback', 'afgerond'];

export class UpdateActivityDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ACTIVITY_TYPES })
  @IsIn(ACTIVITY_TYPES)
  @IsOptional()
  type?: ActivityType;

  @ApiPropertyOptional({ enum: ACTIVITY_STATUSES })
  @IsIn(ACTIVITY_STATUSES)
  @IsOptional()
  status?: ActivityStatus;

  @ApiPropertyOptional({ example: '2026-03-14' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'deadline must be a date in YYYY-MM-DD format' })
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  competencyLabel?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  position?: number;
}
