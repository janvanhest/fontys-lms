import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetenceFramework } from './competence-framework.entity';
import type { HboiActivity, HboiLayer } from './competence-progress.entity';
import { CompetenceProgress } from './competence-progress.entity';
import {
  ALL_HBOI_ACTIVITIES,
  HBOI_ACTIVITIES,
  HBOI_LAYERS,
  PROFESSIONAL_DEVELOPMENT_AREAS,
} from './competence.constants';
import { CompetenceCellDto, CompetenceFrameworkDto } from './dto/competence-framework.dto';
import { SetCompetenceDto } from './dto/set-competence.dto';

@Injectable()
export class CompetenceService {
  constructor(
    @InjectRepository(CompetenceProgress)
    private readonly repo: Repository<CompetenceProgress>,
    @InjectRepository(CompetenceFramework)
    private readonly frameworkRepo: Repository<CompetenceFramework>,
  ) {}

  /** Alle competentievoortgang van een student, gesorteerd op laag en activiteit. */
  findAll(studentId: string): Promise<CompetenceProgress[]> {
    return this.repo.find({
      where: { studentId },
      order: { layer: 'ASC', hboiActivity: 'ASC' },
    });
  }

  /**
   * De volledige raamwerkstructuur met beschrijvingen, opgebouwd uit de
   * competence_framework-tabel. Statisch, gelijk voor elke student.
   */
  async getFramework(): Promise<CompetenceFrameworkDto> {
    const rows = await this.frameworkRepo.find();
    const cellsByKey = new Map<string, CompetenceCellDto>();

    for (const row of rows) {
      const key = `${row.layer}::${row.hboiActivity}`;
      let cell = cellsByKey.get(key);
      if (!cell) {
        cell = {
          layer: row.layer,
          hboiActivity: row.hboiActivity,
          minLevel: row.level,
          maxLevel: row.level,
          levels: [],
        };
        cellsByKey.set(key, cell);
      }
      cell.levels.push({ level: row.level, description: row.description });
      cell.minLevel = Math.min(cell.minLevel, row.level);
      cell.maxLevel = Math.max(cell.maxLevel, row.level);
    }

    const layerOrder = (layer: HboiLayer): number => HBOI_LAYERS.indexOf(layer);
    const activityOrder = (activity: HboiActivity): number =>
      ALL_HBOI_ACTIVITIES.indexOf(activity);

    const cells = [...cellsByKey.values()].sort(
      (a, b) =>
        layerOrder(a.layer) - layerOrder(b.layer) ||
        activityOrder(a.hboiActivity) - activityOrder(b.hboiActivity),
    );
    for (const cell of cells) {
      cell.levels.sort((a, b) => a.level - b.level);
    }

    return {
      layers: HBOI_LAYERS,
      activities: HBOI_ACTIVITIES,
      professionalDevelopmentAreas: PROFESSIONAL_DEVELOPMENT_AREAS,
      cells,
    };
  }

  /**
   * Zet het behaalde en gekozen niveau voor één cel (laag x activiteit) van de
   * student. De combinatie en de niveaus worden getoetst aan het raamwerk in de
   * competence_framework-tabel. Bestaat de rij al, dan wordt hij overschreven.
   */
  async setCompetence(studentId: string, dto: SetCompetenceDto): Promise<CompetenceProgress> {
    const cellRows = await this.frameworkRepo.find({
      where: { layer: dto.layer, hboiActivity: dto.hboiActivity },
    });
    if (cellRows.length === 0) {
      throw new BadRequestException(
        `Ongeldige competentie: de laag ${dto.layer} kent de activiteit ${dto.hboiActivity} niet`,
      );
    }
    const validLevels = cellRows.map((row) => row.level);

    const achievedLevel = dto.achievedLevel ?? null;
    const targetLevel = dto.targetLevel ?? null;
    this.assertLevelValid(achievedLevel, validLevels, dto, 'achievedLevel');
    this.assertLevelValid(targetLevel, validLevels, dto, 'targetLevel');

    const existing = await this.repo.findOne({
      where: { studentId, layer: dto.layer, hboiActivity: dto.hboiActivity },
    });

    const row = this.repo.create({
      ...existing,
      studentId,
      layer: dto.layer,
      hboiActivity: dto.hboiActivity,
      achievedLevel,
      targetLevel,
      explanation: dto.explanation ?? null,
    });

    return this.repo.save(row);
  }

  private assertLevelValid(
    level: number | null,
    validLevels: number[],
    dto: SetCompetenceDto,
    field: 'achievedLevel' | 'targetLevel',
  ): void {
    if (level === null) {
      return;
    }
    if (!validLevels.includes(level)) {
      throw new BadRequestException(
        `${field} ${level} bestaat niet voor ${dto.layer} - ${dto.hboiActivity}`,
      );
    }
  }
}
