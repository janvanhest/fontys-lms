import { ApiProperty } from '@nestjs/swagger';
import { HBOI_LAYERS } from '../competence.constants';
import type { HboiActivity, HboiLayer } from '../competence-progress.entity';

// Eén niveau binnen een cel, met de officiele HBO-i beschrijving.
export class CompetenceLevelDto {
  @ApiProperty({ example: 1 })
  level!: number;

  @ApiProperty({ example: 'Voer basisanalyses uit van gebruikersinteractieprocessen ...' })
  description!: string;
}

// Eén cel van het raamwerk: een laag-activiteit-combinatie met de niveaus die
// daar bestaan en hun beschrijving.
export class CompetenceCellDto {
  @ApiProperty({ enum: HBOI_LAYERS, example: 'Infrastructure' })
  layer!: HboiLayer;

  @ApiProperty({ example: 'Analysis' })
  hboiActivity!: HboiActivity;

  @ApiProperty({ example: 1 })
  minLevel!: number;

  @ApiProperty({ example: 3 })
  maxLevel!: number;

  @ApiProperty({ type: [CompetenceLevelDto] })
  levels!: CompetenceLevelDto[];
}

// De volledige raamwerkstructuur met beschrijvingen die de frontend nodig heeft
// om het competentie-grid te tekenen. Statisch, gelijk voor elke student.
export class CompetenceFrameworkDto {
  @ApiProperty({ enum: HBOI_LAYERS, isArray: true })
  layers!: HboiLayer[];

  @ApiProperty({
    isArray: true,
    example: ['Analysis', 'Advise', 'Design', 'Realisation', 'Manage&Control'],
  })
  activities!: HboiActivity[];

  @ApiProperty({ isArray: true, example: ['Personal leadership', 'Professional standard'] })
  professionalDevelopmentAreas!: HboiActivity[];

  @ApiProperty({ type: [CompetenceCellDto] })
  cells!: CompetenceCellDto[];
}
