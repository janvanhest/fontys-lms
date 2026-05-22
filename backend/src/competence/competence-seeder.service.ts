import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MOCK_STUDENT } from '../auth/guards/mock-auth.guard';
import { StudentService } from '../student/student.service';
import { CompetenceProgress } from './competence-progress.entity';
import type { HboiActivity, HboiLayer } from './competence-progress.entity';
import { HBOI_ACTIVITIES } from './competence.constants';

type SeedRow = {
  layer: HboiLayer;
  hboiActivity: HboiActivity;
  achievedLevel: number | null;
  targetLevel: number | null;
};

// Echte selecties van de mock-student uit de Canvas competence tool: Software
// volledig behaald op niveau 2, Infrastructure gekozen als doel op niveau 1, en
// Personal leadership en Professional standard behaald op niveau 1 met doel
// niveau 2.
const SEED_PROGRESS: SeedRow[] = [
  ...HBOI_ACTIVITIES.map(
    (activity): SeedRow => ({
      layer: 'Software',
      hboiActivity: activity,
      achievedLevel: 2,
      targetLevel: null,
    }),
  ),
  ...HBOI_ACTIVITIES.map(
    (activity): SeedRow => ({
      layer: 'Infrastructure',
      hboiActivity: activity,
      achievedLevel: null,
      targetLevel: 1,
    }),
  ),
  {
    layer: 'Professional Development',
    hboiActivity: 'Personal leadership',
    achievedLevel: 1,
    targetLevel: 2,
  },
  {
    layer: 'Professional Development',
    hboiActivity: 'Professional standard',
    achievedLevel: 1,
    targetLevel: 2,
  },
];

// Vult bij het opstarten de competentievoortgang van de mock-student, zodat de
// PoC meteen realistische data heeft. Draait alleen in development (MOCK_AUTH)
// en is idempotent: bestaat er al voortgang, dan slaat hij het over.
@Injectable()
export class CompetenceSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CompetenceSeederService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly studentService: StudentService,
    @InjectRepository(CompetenceProgress)
    private readonly repo: Repository<CompetenceProgress>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.configService.get<boolean>('MOCK_AUTH', false)) {
      return;
    }

    try {
      const student = await this.studentService.findOrCreate(MOCK_STUDENT);
      const existing = await this.repo.count({ where: { studentId: student.id } });
      if (existing > 0) {
        this.logger.log('Competentievoortgang al aanwezig voor mock student, seeding overgeslagen');
        return;
      }

      const rows = SEED_PROGRESS.map((row) =>
        this.repo.create({ ...row, studentId: student.id, explanation: null }),
      );
      await this.repo.save(rows);
      this.logger.log(`Competentievoortgang geseed voor mock student (${rows.length} cellen)`);
    } catch (error) {
      this.logger.error('Competentie-seeding mislukt', error as Error);
    }
  }
}
