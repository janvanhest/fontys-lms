import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetenceProgress } from './competence-progress.entity';
import { CompetenceService } from './competence.service';
import { SetCompetenceDto } from './dto/set-competence.dto';

const STUDENT_A = 'student-a-uuid';

const makeRow = (overrides: Partial<CompetenceProgress> = {}): CompetenceProgress => ({
  id: 'comp-uuid-1',
  studentId: STUDENT_A,
  layer: 'Infrastructure',
  hboiActivity: 'Analysis',
  achievedLevel: null,
  targetLevel: null,
  explanation: null,
  createdAt: new Date('2026-05-22'),
  updatedAt: new Date('2026-05-22'),
  ...overrides,
});

describe('CompetenceService', () => {
  let service: CompetenceService;
  let repo: jest.Mocked<
    Pick<Repository<CompetenceProgress>, 'find' | 'findOne' | 'create' | 'save'>
  >;

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetenceService,
        { provide: getRepositoryToken(CompetenceProgress), useValue: repo },
      ],
    }).compile();

    service = module.get<CompetenceService>(CompetenceService);
  });

  describe('findAll', () => {
    it('returns the competence rows for the student sorted by layer and activity', async () => {
      const rows = [makeRow({ id: 'c1' }), makeRow({ id: 'c2' })];
      repo.find.mockResolvedValue(rows);

      const result = await service.findAll(STUDENT_A);

      expect(repo.find).toHaveBeenCalledWith({
        where: { studentId: STUDENT_A },
        order: { layer: 'ASC', hboiActivity: 'ASC' },
      });
      expect(result).toEqual(rows);
    });
  });

  describe('setCompetence', () => {
    it('creates a new row when the cell has no progress yet', async () => {
      const dto: SetCompetenceDto = {
        layer: 'Infrastructure',
        hboiActivity: 'Analysis',
        achievedLevel: 1,
        targetLevel: 2,
      };
      repo.findOne.mockResolvedValue(null);
      repo.create.mockImplementation((data) => data as CompetenceProgress);
      repo.save.mockImplementation((data) => Promise.resolve(data as CompetenceProgress));

      const result = await service.setCompetence(STUDENT_A, dto);

      expect(repo.create).toHaveBeenCalledWith({
        studentId: STUDENT_A,
        layer: 'Infrastructure',
        hboiActivity: 'Analysis',
        achievedLevel: 1,
        targetLevel: 2,
        explanation: null,
      });
      expect(result.achievedLevel).toBe(1);
      expect(result.targetLevel).toBe(2);
    });

    it('overwrites the existing row when the cell already has progress', async () => {
      const existing = makeRow({ achievedLevel: 1, targetLevel: null });
      const dto: SetCompetenceDto = {
        layer: 'Infrastructure',
        hboiActivity: 'Analysis',
        achievedLevel: 2,
        targetLevel: 3,
      };
      repo.findOne.mockResolvedValue(existing);
      repo.create.mockImplementation((data) => data as CompetenceProgress);
      repo.save.mockImplementation((data) => Promise.resolve(data as CompetenceProgress));

      const result = await service.setCompetence(STUDENT_A, dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'comp-uuid-1', achievedLevel: 2, targetLevel: 3 }),
      );
      expect(result.id).toBe('comp-uuid-1');
    });

    it('treats a missing level as empty (null)', async () => {
      const dto: SetCompetenceDto = {
        layer: 'Infrastructure',
        hboiActivity: 'Analysis',
        achievedLevel: 1,
      };
      repo.findOne.mockResolvedValue(null);
      repo.create.mockImplementation((data) => data as CompetenceProgress);
      repo.save.mockImplementation((data) => Promise.resolve(data as CompetenceProgress));

      const result = await service.setCompetence(STUDENT_A, dto);

      expect(result.targetLevel).toBeNull();
    });

    it('rejects a layer-activity combination that is not in the framework', async () => {
      const dto: SetCompetenceDto = {
        layer: 'Infrastructure',
        hboiActivity: 'Personal Leadership',
      };

      await expect(service.setCompetence(STUDENT_A, dto)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('rejects a level above the maximum for the cell', async () => {
      const dto: SetCompetenceDto = {
        layer: 'Professional Development',
        hboiActivity: 'Personal Leadership',
        achievedLevel: 3,
      };

      await expect(service.setCompetence(STUDENT_A, dto)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });
});
