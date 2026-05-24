import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetenceFramework } from './competence-framework.entity';
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

const makeFrameworkRow = (overrides: Partial<CompetenceFramework> = {}): CompetenceFramework => ({
  id: 'fw-uuid-1',
  layer: 'Infrastructure',
  hboiActivity: 'Analysis',
  level: 1,
  description: 'Voer basisanalyses uit.',
  ...overrides,
});

describe('CompetenceService', () => {
  let service: CompetenceService;
  let repo: jest.Mocked<
    Pick<Repository<CompetenceProgress>, 'find' | 'findOne' | 'create' | 'save'>
  >;
  let frameworkRepo: jest.Mocked<Pick<Repository<CompetenceFramework>, 'find'>>;

  beforeEach(async () => {
    repo = { find: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    frameworkRepo = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetenceService,
        { provide: getRepositoryToken(CompetenceProgress), useValue: repo },
        { provide: getRepositoryToken(CompetenceFramework), useValue: frameworkRepo },
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
      frameworkRepo.find.mockResolvedValue([
        makeFrameworkRow({ level: 1 }),
        makeFrameworkRow({ id: 'fw-2', level: 2 }),
        makeFrameworkRow({ id: 'fw-3', level: 3 }),
      ]);
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
    });

    it('overwrites the existing row when the cell already has progress', async () => {
      const existing = makeRow({ achievedLevel: 1 });
      const dto: SetCompetenceDto = {
        layer: 'Infrastructure',
        hboiActivity: 'Analysis',
        achievedLevel: 2,
      };
      frameworkRepo.find.mockResolvedValue([
        makeFrameworkRow({ level: 1 }),
        makeFrameworkRow({ id: 'fw-2', level: 2 }),
        makeFrameworkRow({ id: 'fw-3', level: 3 }),
      ]);
      repo.findOne.mockResolvedValue(existing);
      repo.create.mockImplementation((data) => data as CompetenceProgress);
      repo.save.mockImplementation((data) => Promise.resolve(data as CompetenceProgress));

      const result = await service.setCompetence(STUDENT_A, dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'comp-uuid-1', achievedLevel: 2 }),
      );
      expect(result.id).toBe('comp-uuid-1');
    });

    it('rejects a layer-activity combination that is not in the framework', async () => {
      const dto: SetCompetenceDto = {
        layer: 'Infrastructure',
        hboiActivity: 'Personal leadership',
      };
      frameworkRepo.find.mockResolvedValue([]);

      await expect(service.setCompetence(STUDENT_A, dto)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('rejects a level that does not exist for the cell', async () => {
      const dto: SetCompetenceDto = {
        layer: 'Professional Development',
        hboiActivity: 'Personal leadership',
        achievedLevel: 3,
      };
      frameworkRepo.find.mockResolvedValue([
        makeFrameworkRow({
          layer: 'Professional Development',
          hboiActivity: 'Personal leadership',
          level: 1,
        }),
        makeFrameworkRow({
          id: 'fw-2',
          layer: 'Professional Development',
          hboiActivity: 'Personal leadership',
          level: 2,
        }),
      ]);

      await expect(service.setCompetence(STUDENT_A, dto)).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('getFramework', () => {
    it('groups framework rows into cells with their levels', async () => {
      frameworkRepo.find.mockResolvedValue([
        makeFrameworkRow({ id: 'a', level: 1, description: 'niveau 1' }),
        makeFrameworkRow({ id: 'b', level: 3, description: 'niveau 3' }),
        makeFrameworkRow({ id: 'c', level: 2, description: 'niveau 2' }),
        makeFrameworkRow({
          id: 'd',
          layer: 'Professional Development',
          hboiActivity: 'Personal leadership',
          level: 1,
          description: 'pd 1',
        }),
        makeFrameworkRow({
          id: 'e',
          layer: 'Professional Development',
          hboiActivity: 'Personal leadership',
          level: 2,
          description: 'pd 2',
        }),
      ]);

      const framework = await service.getFramework();

      expect(framework.layers).toHaveLength(6);
      expect(framework.activities).toHaveLength(5);
      expect(framework.cells).toHaveLength(2);

      const infraAnalysis = framework.cells.find(
        (cell) => cell.layer === 'Infrastructure' && cell.hboiActivity === 'Analysis',
      );
      expect(infraAnalysis?.minLevel).toBe(1);
      expect(infraAnalysis?.maxLevel).toBe(3);
      expect(infraAnalysis?.levels.map((entry) => entry.level)).toEqual([1, 2, 3]);

      const pdCell = framework.cells.find((cell) => cell.layer === 'Professional Development');
      expect(pdCell?.minLevel).toBe(1);
      expect(pdCell?.maxLevel).toBe(2);
    });
  });
});
