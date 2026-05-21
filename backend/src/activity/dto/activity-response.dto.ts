import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ActivityStatus, ActivityType } from '../activity.entity';

export class ActivityResponseDto {
  @Expose()
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string;

  @Expose()
  @ApiPropertyOptional({ example: 7238 })
  portflowId!: number | null;

  @Expose()
  @ApiProperty({ example: 'Brainstorm' })
  title!: string;

  @Expose()
  @ApiPropertyOptional()
  description!: string | null;

  @Expose()
  @ApiProperty({ example: 8 })
  position!: number;

  @Expose()
  @ApiProperty({ example: 'opdracht' })
  type!: ActivityType;

  @Expose()
  @ApiProperty({ example: 'open' })
  status!: ActivityStatus;

  @Expose()
  @ApiPropertyOptional({ example: '2026-03-14' })
  deadline!: string | null;

  @Expose()
  @ApiPropertyOptional()
  competencyLabel!: string | null;

  @Expose()
  @ApiProperty()
  createdAt!: Date;

  @Expose()
  @ApiProperty()
  updatedAt!: Date;
}
