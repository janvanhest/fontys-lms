import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  ALL_HBOI_ACTIVITIES,
  HBOI_LAYERS,
  MAX_LEVEL,
  MIN_LEVEL,
} from '../competence.constants';
import type { HboiActivity, HboiLayer } from '../competence-progress.entity';

// Zet het behaalde en gekozen niveau voor één cel (laag x activiteit). Een
// weggelaten of leeg niveau betekent dat de student daar nog niks heeft staan.
export class SetCompetenceDto {
  @ApiProperty({ enum: HBOI_LAYERS, example: 'Infrastructure' })
  @IsIn(HBOI_LAYERS)
  layer!: HboiLayer;

  @ApiProperty({ enum: ALL_HBOI_ACTIVITIES, example: 'Analysis' })
  @IsIn(ALL_HBOI_ACTIVITIES)
  hboiActivity!: HboiActivity;

  @ApiPropertyOptional({ minimum: MIN_LEVEL, maximum: MAX_LEVEL, example: 1 })
  @IsInt()
  @Min(MIN_LEVEL)
  @Max(MAX_LEVEL)
  @IsOptional()
  achievedLevel?: number | null;

  @ApiPropertyOptional({ minimum: MIN_LEVEL, maximum: MAX_LEVEL, example: 2 })
  @IsInt()
  @Min(MIN_LEVEL)
  @Max(MAX_LEVEL)
  @IsOptional()
  targetLevel?: number | null;

  @ApiPropertyOptional({ example: 'Aangetoond met de Canvas API-koppeling.' })
  @IsString()
  @IsOptional()
  explanation?: string | null;
}
