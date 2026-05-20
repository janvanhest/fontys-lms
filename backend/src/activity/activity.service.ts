import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

const SEED_ACTIVITIES: Omit<Activity, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>[] = [
  { portflowId: 7178, title: 'Context helder krijgen', description: 'Analyseer en beschrijf de projectcontext.', position: 1, type: 'opdracht', status: 'afgerond', deadline: '2026-03-07', competencyLabel: 'Software - Analyseren - Niveau 2' },
  { portflowId: 7179, title: 'Probleem helder krijgen', description: 'Formuleer een heldere probleemstelling.', position: 2, type: 'opdracht', status: 'afgerond', deadline: '2026-03-11', competencyLabel: 'Software - Analyseren - Niveau 2' },
  { portflowId: 7193, title: 'Oorzaak en Context', description: 'Onderzoek de oorzaken achter het probleem.', position: 3, type: 'opdracht', status: 'afgerond', deadline: '2026-03-13', competencyLabel: 'Software - Analyseren - Niveau 2' },
  { portflowId: 7202, title: 'Opzetten vragenlijst', description: 'Ontwerp een vragenlijst voor stakeholders.', position: 4, type: 'opdracht', status: 'bezig', deadline: '2026-05-21', competencyLabel: 'Software - Adviseren - Niveau 2' },
  { portflowId: 7209, title: 'Stakeholderanalyse', description: 'Identificeer en analyseer alle stakeholders.', position: 5, type: 'opdracht', status: 'open', deadline: '2026-05-23', competencyLabel: 'Software - Adviseren - Niveau 2' },
  { portflowId: 7219, title: 'Domeinmodellen', description: null, position: 6, type: 'opdracht', status: 'open', deadline: '2026-05-26', competencyLabel: 'Software - Ontwerpen - Niveau 2' },
  { portflowId: 7237, title: 'Risico Tabel', description: null, position: 7, type: 'opdracht', status: 'open', deadline: '2026-05-28', competencyLabel: 'Software - Ontwerpen - Niveau 2' },
  { portflowId: 7238, title: 'Brainstorm', description: null, position: 8, type: 'workshop', status: 'open', deadline: '2026-06-04', competencyLabel: null },
  { portflowId: 7239, title: 'Scenariovergelijkingstabel', description: null, position: 9, type: 'opdracht', status: 'open', deadline: '2026-06-11', competencyLabel: 'Software - Ontwerpen - Niveau 3' },
  { portflowId: 7180, title: 'Persoonlijk ontwikkelplan', description: 'Schrijf een persoonlijk ontwikkelplan voor dit semester.', position: 10, type: 'eigen activiteit', status: 'open', deadline: '2026-06-18', competencyLabel: null },
];

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly repo: Repository<Activity>,
  ) {}

  findAll(studentId: string): Promise<Activity[]> {
    return this.repo.find({
      where: { studentId },
      order: { deadline: { direction: 'ASC', nulls: 'LAST' }, position: 'ASC' },
    });
  }

  async findOne(id: string, studentId: string): Promise<Activity> {
    const activity = await this.repo.findOne({ where: { id } });
    if (!activity || activity.studentId !== studentId) {
      throw new NotFoundException(`Activity ${id} not found`);
    }
    return activity;
  }

  create(studentId: string, dto: CreateActivityDto): Promise<Activity> {
    const activity = this.repo.create({
      ...dto,
      studentId,
      position: dto.position ?? 0,
      status: dto.status ?? 'open',
    });
    return this.repo.save(activity);
  }

  async update(id: string, studentId: string, dto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id, studentId);
    return this.repo.save({ ...activity, ...dto });
  }

  async remove(id: string, studentId: string): Promise<void> {
    await this.findOne(id, studentId);
    await this.repo.delete(id);
  }

  async seed(studentId: string): Promise<Activity[]> {
    await this.repo.delete({ studentId });
    const activities = SEED_ACTIVITIES.map((data) =>
      this.repo.create({ ...data, studentId }),
    );
    return Promise.all(activities.map((a) => this.repo.save(a)));
  }
}
