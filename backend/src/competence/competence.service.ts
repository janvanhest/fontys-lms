import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetenceProgress } from './competence-progress.entity';
import { findCompetenceCell, type CompetenceCell } from './competence.constants';
import { SetCompetenceDto } from './dto/set-competence.dto';

@Injectable()
export class CompetenceService {
  constructor(
    @InjectRepository(CompetenceProgress)
    private readonly repo: Repository<CompetenceProgress>,
  ) {}

  /** Alle competentievoortgang van een student, gesorteerd op laag en activiteit. */
  findAll(studentId: string): Promise<CompetenceProgress[]> {
    return this.repo.find({
      where: { studentId },
      order: { layer: 'ASC', hboiActivity: 'ASC' },
    });
  }

  /**
   * Zet het behaalde en gekozen niveau voor één cel (laag x activiteit) van de
   * student. Bestaat de rij al, dan wordt hij overschreven; anders nieuw
   * aangemaakt. Een weggelaten niveau wordt als leeg (null) opgeslagen.
   */
  async setCompetence(studentId: string, dto: SetCompetenceDto): Promise<CompetenceProgress> {
    const cell = findCompetenceCell(dto.layer, dto.hboiActivity);
    if (!cell) {
      throw new BadRequestException(
        `Ongeldige competentie: de laag ${dto.layer} kent de activiteit ${dto.hboiActivity} niet`,
      );
    }

    const achievedLevel = dto.achievedLevel ?? null;
    const targetLevel = dto.targetLevel ?? null;
    this.assertLevelWithinCell(achievedLevel, cell, 'achievedLevel');
    this.assertLevelWithinCell(targetLevel, cell, 'targetLevel');

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

  private assertLevelWithinCell(
    level: number | null,
    cell: CompetenceCell,
    field: 'achievedLevel' | 'targetLevel',
  ): void {
    if (level !== null && level > cell.maxLevel) {
      throw new BadRequestException(
        `${field} ${level} ligt boven het maximum van niveau ${cell.maxLevel} voor ${cell.layer} - ${cell.activity}`,
      );
    }
  }
}
