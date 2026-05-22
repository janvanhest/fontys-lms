import { Test, TestingModule } from '@nestjs/testing';
import { CompetenceService } from '../../competence/competence.service';
import { CompetenceProgress } from '../../competence/competence-progress.entity';
import { GetStudentCompetencesTool } from './get-student-competences.tool';

const makeRow = (overrides: Partial<CompetenceProgress> = {}): CompetenceProgress => ({
  id: 'comp-1',
  studentId: 'student-1',
  layer: 'Software',
  hboiActivity: 'Analysis',
  achievedLevel: 2,
  targetLevel: null,
  explanation: null,
  createdAt: new Date('2026-05-22'),
  updatedAt: new Date('2026-05-22'),
  ...overrides,
});

describe('GetStudentCompetencesTool', () => {
  let tool: GetStudentCompetencesTool;
  let competenceService: { findAll: jest.Mock };

  beforeEach(async () => {
    competenceService = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStudentCompetencesTool,
        { provide: CompetenceService, useValue: competenceService },
      ],
    }).compile();

    tool = module.get<GetStudentCompetencesTool>(GetStudentCompetencesTool);
  });

  it('returns the student competences as JSON without internal fields', async () => {
    competenceService.findAll.mockResolvedValue([makeRow()]);

    const result = await tool.execute('student-1');

    expect(competenceService.findAll).toHaveBeenCalledWith('student-1');
    const parsed = JSON.parse(result) as { competences: unknown[] };
    expect(parsed.competences).toEqual([
      {
        layer: 'Software',
        hboiActivity: 'Analysis',
        achievedLevel: 2,
        targetLevel: null,
        explanation: null,
      },
    ]);
  });
});
