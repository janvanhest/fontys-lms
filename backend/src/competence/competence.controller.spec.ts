import { Test, TestingModule } from '@nestjs/testing';
import { CompetenceProgress } from './competence-progress.entity';
import { CompetenceController } from './competence.controller';
import { CompetenceService } from './competence.service';
import { CompetenceFrameworkDto } from './dto/competence-framework.dto';
import { SetCompetenceDto } from './dto/set-competence.dto';
import { Student } from '../student/student.entity';

const student = { id: 'student-a-uuid' } as Student;

const makeRow = (overrides: Partial<CompetenceProgress> = {}): CompetenceProgress => ({
  id: 'comp-uuid-1',
  studentId: 'student-a-uuid',
  layer: 'Infrastructure',
  hboiActivity: 'Analysis',
  achievedLevel: 1,
  targetLevel: 2,
  explanation: null,
  createdAt: new Date('2026-05-22'),
  updatedAt: new Date('2026-05-22'),
  ...overrides,
});

describe('CompetenceController', () => {
  let controller: CompetenceController;
  let service: jest.Mocked<
    Pick<CompetenceService, 'findAll' | 'setCompetence' | 'getFramework'>
  >;

  beforeEach(async () => {
    service = { findAll: jest.fn(), setCompetence: jest.fn(), getFramework: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetenceController],
      providers: [{ provide: CompetenceService, useValue: service }],
    }).compile();

    controller = module.get<CompetenceController>(CompetenceController);
  });

  it('returns the competence progress of the current student without exposing studentId', async () => {
    service.findAll.mockResolvedValue([makeRow()]);

    const result = await controller.findAll(student);

    expect(service.findAll).toHaveBeenCalledWith('student-a-uuid');
    expect(result).toHaveLength(1);
    expect(result[0].layer).toBe('Infrastructure');
    expect(result[0]).not.toHaveProperty('studentId');
  });

  it('delegates set to the service for the current student', async () => {
    const dto: SetCompetenceDto = {
      layer: 'Infrastructure',
      hboiActivity: 'Analysis',
      achievedLevel: 2,
    };
    service.setCompetence.mockResolvedValue(makeRow({ achievedLevel: 2 }));

    const result = await controller.set(dto, student);

    expect(service.setCompetence).toHaveBeenCalledWith('student-a-uuid', dto);
    expect(result.achievedLevel).toBe(2);
    expect(result).not.toHaveProperty('studentId');
  });

  it('returns the framework structure from the service', async () => {
    const framework: CompetenceFrameworkDto = {
      layers: ['Infrastructure'],
      activities: ['Analysis'],
      professionalDevelopmentAreas: ['Personal leadership'],
      cells: [
        {
          layer: 'Infrastructure',
          hboiActivity: 'Analysis',
          minLevel: 1,
          maxLevel: 3,
          levels: [{ level: 1, description: 'Voer basisanalyses uit.' }],
        },
      ],
    };
    service.getFramework.mockResolvedValue(framework);

    const result = await controller.getFramework();

    expect(result).toBe(framework);
  });
});
