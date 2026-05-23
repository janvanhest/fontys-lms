import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HBOI_LAYERS } from '../competence.constants';
import type { HboiActivity, HboiLayer } from '../competence-progress.entity';

export class CompetenceResponseDto {
  @Expose()
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string;

  @Expose()
  @ApiProperty({ enum: HBOI_LAYERS, example: 'Infrastructure' })
  layer!: HboiLayer;

  @Expose()
  @ApiProperty({ example: 'Analysis' })
  hboiActivity!: HboiActivity;

  @Expose()
  @ApiPropertyOptional({ example: 1 })
  achievedLevel!: number | null;

  @Expose()
  @ApiPropertyOptional({ example: 2 })
  targetLevel!: number | null;

  @Expose()
  @ApiPropertyOptional()
  explanation!: string | null;

  @Expose()
  @ApiProperty()
  createdAt!: Date;

  @Expose()
  @ApiProperty()
  updatedAt!: Date;
}
