import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BerichtEntity, BerichtRol } from './bericht.entity';
import { GesprekEntity } from './gesprek.entity';

@Injectable()
export class GesprekService {
  constructor(
    @InjectRepository(GesprekEntity)
    private readonly gesprekRepository: Repository<GesprekEntity>,
    @InjectRepository(BerichtEntity)
    private readonly berichtRepository: Repository<BerichtEntity>,
  ) {}

  async maakNieuwGesprek(studentId: string): Promise<GesprekEntity> {
    return this.gesprekRepository.save({ studentId, berichten: [] });
  }

  async vindGesprekkenVanStudent(studentId: string): Promise<GesprekEntity[]> {
    return this.gesprekRepository.find({
      where: { studentId },
      order: { aangemaaktOp: 'DESC' },
    });
  }

  async vindGesprekMetBerichten(gesprekId: string): Promise<GesprekEntity | null> {
    return this.gesprekRepository.findOne({
      where: { id: gesprekId },
      relations: ['berichten'],
      order: { berichten: { timestamp: 'ASC' } },
    });
  }

  async voegBerichtToe(
    gesprekId: string,
    rol: BerichtRol,
    inhoud: string,
  ): Promise<BerichtEntity> {
    return this.berichtRepository.save({ gesprekId, rol, inhoud });
  }
}
