import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import type { ActivityStatus, ActivityType } from '../activity.entity';
import { IsActivityDeadline } from './is-activity-deadline.validator';

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
  @IsActivityDeadline()
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
