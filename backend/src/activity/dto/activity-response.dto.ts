import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ActivityStatus, ActivityType } from '../activity.entity';

export class ActivityResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string;

  @ApiPropertyOptional({ example: 7238 })
  portflowId!: number | null;

  @ApiProperty({ example: 'Brainstorm' })
  title!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiProperty({ example: 8 })
  position!: number;

  @ApiProperty({ example: 'opdracht' })
  type!: ActivityType;

  @ApiProperty({ example: 'open' })
  status!: ActivityStatus;

  @ApiPropertyOptional({ example: '2026-03-14' })
  deadline!: string | null;

  @ApiPropertyOptional()
  competencyLabel!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
