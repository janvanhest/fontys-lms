import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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

export class CreateActivityDto {
  @ApiProperty({ example: 'Brainstorm' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Omschrijving van de activiteit' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 7238 })
  @IsInt()
  @IsOptional()
  portflowId?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @IsOptional()
  position?: number;

  @ApiProperty({ enum: ACTIVITY_TYPES, example: 'opdracht' })
  @IsIn(ACTIVITY_TYPES)
  type!: ActivityType;

  @ApiPropertyOptional({ enum: ACTIVITY_STATUSES, example: 'open' })
  @IsIn(ACTIVITY_STATUSES)
  @IsOptional()
  status?: ActivityStatus;

  @ApiPropertyOptional({ example: '2026-03-14' })
  @IsDateString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ example: 'Software - Realiseren - Niveau 2' })
  @IsString()
  @IsOptional()
  competencyLabel?: string;
}
