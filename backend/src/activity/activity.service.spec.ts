import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { ActivityService, SEED_ACTIVITIES } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

const STUDENT_A = 'student-a-uuid';

const makeActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: 'act-uuid-1',
  studentId: STUDENT_A,
  portflowId: null,
  title: 'Test activiteit',
  description: null,
  position: 0,
  type: 'opdracht',
  status: 'open',
  deadline: null,
  competencyLabel: null,
  createdAt: new Date('2026-05-20'),
  updatedAt: new Date('2026-05-20'),
  ...overrides,
});

describe('ActivityService', () => {
  let service: ActivityService;
  let repo: jest.Mocked<
    Pick<Repository<Activity>, 'findOne' | 'create' | 'save' | 'delete' | 'createQueryBuilder'>
  >;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityService, { provide: getRepositoryToken(Activity), useValue: repo }],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  describe('findAll', () => {
    it('returns activities for the student sorted by deadline then position', async () => {
      const activities = [makeActivity({ id: 'a1' }), makeActivity({ id: 'a2' })];
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(activities),
      };
      repo.createQueryBuilder.mockReturnValue(mockQb as any);

      const result = await service.findAll(STUDENT_A);

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('activity');
      expect(mockQb.where).toHaveBeenCalledWith('activity.studentId = :studentId', {
        studentId: STUDENT_A,
      });
      expect(mockQb.orderBy).toHaveBeenCalledWith('activity.deadline', 'ASC', 'NULLS LAST');
      expect(mockQb.addOrderBy).toHaveBeenCalledWith('activity.position', 'ASC');
      expect(mockQb.addOrderBy).toHaveBeenCalledWith('activity.createdAt', 'ASC');
      expect(result).toEqual(activities);
    });
  });

  describe('findOne', () => {
    it('returns the activity and enforces ownership via query', async () => {
      const activity = makeActivity();
      repo.findOne.mockResolvedValue(activity);

      const result = await service.findOne('act-uuid-1', STUDENT_A);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'act-uuid-1', studentId: STUDENT_A },
      });
      expect(result).toEqual(activity);
    });

    it('throws NotFoundException when not found or not owned', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id', STUDENT_A)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and saves an activity for the student', async () => {
      const dto: CreateActivityDto = { title: 'Nieuwe activiteit', type: 'workshop' };
      const created = makeActivity({ title: 'Nieuwe activiteit', type: 'workshop' });
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      const result = await service.create(STUDENT_A, dto);

      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        studentId: STUDENT_A,
        position: 0,
        status: 'open',
      });
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('updates and returns the activity', async () => {
      const activity = makeActivity();
      const dto: UpdateActivityDto = { status: 'bezig' };
      const updated = { ...activity, status: 'bezig' } as Activity;
      repo.findOne.mockResolvedValue(activity);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('act-uuid-1', STUDENT_A, dto);

      expect(repo.save).toHaveBeenCalledWith({ ...activity, ...dto });
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when not found or not owned', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update('act-uuid-1', STUDENT_A, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the activity when it belongs to the student', async () => {
      repo.findOne.mockResolvedValue(makeActivity());

      await service.remove('act-uuid-1', STUDENT_A);

      expect(repo.delete).toHaveBeenCalledWith('act-uuid-1');
    });

    it('throws NotFoundException when not found or not owned', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('act-uuid-1', STUDENT_A)).rejects.toThrow(NotFoundException);
    });
  });

  describe('seed', () => {
    it('verwijdert bestaande activiteiten en maakt seed activiteiten aan', async () => {
      repo.delete.mockResolvedValue({ affected: 5, raw: [] });
      repo.create.mockImplementation((data) => data as Activity);
      repo.save.mockImplementation((data) => Promise.resolve(data as Activity));

      const results = await service.seed(STUDENT_A);

      expect(repo.delete).toHaveBeenCalledWith({ studentId: STUDENT_A });
      expect(results).toHaveLength(SEED_ACTIVITIES.length);
    });

    it('throws in production before modifying data', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        await expect(service.seed(STUDENT_A)).rejects.toThrow(
          'ActivityService.seed() is not allowed in production',
        );
        expect(repo.delete).not.toHaveBeenCalled();
        expect(repo.save).not.toHaveBeenCalled();
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });

  describe('searchForChat', () => {
    it('applies student ownership plus structured filters', async () => {
      const activities = [makeActivity({ id: 'a-open', status: 'open', type: 'workshop' })];
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(activities),
      };
      repo.createQueryBuilder.mockReturnValue(mockQb as any);

      const result = await service.searchForChat(STUDENT_A, {
        status: 'open',
        type: 'workshop',
        deadlineFrom: '2026-06-01',
        deadlineTo: '2026-06-10',
        limit: 5,
      });

      expect(mockQb.where).toHaveBeenCalledWith('activity.studentId = :studentId', {
        studentId: STUDENT_A,
      });
      expect(mockQb.andWhere).toHaveBeenCalledWith('activity.status = :status', { status: 'open' });
      expect(mockQb.andWhere).toHaveBeenCalledWith('activity.type = :type', { type: 'workshop' });
      expect(mockQb.andWhere).toHaveBeenCalledWith('activity.deadline >= :deadlineFrom', {
        deadlineFrom: '2026-06-01',
      });
      expect(mockQb.andWhere).toHaveBeenCalledWith('activity.deadline <= :deadlineTo', {
        deadlineTo: '2026-06-10',
      });
      expect(mockQb.limit).toHaveBeenCalledWith(5);
      expect(result).toEqual({
        appliedFilters: {
          query: null,
          title: null,
          status: 'open',
          type: 'workshop',
          deadlineFrom: '2026-06-01',
          deadlineTo: '2026-06-10',
          limit: 5,
        },
        activities: [
          {
            id: 'a-open',
            title: 'Test activiteit',
            type: 'workshop',
            status: 'open',
            deadline: null,
            competencyLabel: null,
            description: null,
          },
        ],
      });
    });

    it('adds fuzzy query and title matching with stable ordering', async () => {
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      repo.createQueryBuilder.mockReturnValue(mockQb as any);

      await service.searchForChat(STUDENT_A, {
        query: ' Stakeholder ',
        title: ' Analyse ',
      });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        "(LOWER(activity.title) LIKE :query OR LOWER(COALESCE(activity.description, '')) LIKE :query OR LOWER(COALESCE(activity.competencyLabel, '')) LIKE :query)",
        { query: '%stakeholder%' },
      );
      expect(mockQb.andWhere).toHaveBeenCalledWith('LOWER(activity.title) LIKE :title', {
        title: '%analyse%',
      });
      expect(mockQb.orderBy).toHaveBeenCalledWith(
        expect.stringContaining("WHEN activity.status = 'bezig' THEN 0"),
        'ASC',
      );
      expect(mockQb.addOrderBy).toHaveBeenNthCalledWith(1, 'activity.deadline', 'ASC', 'NULLS LAST');
      expect(mockQb.addOrderBy).toHaveBeenNthCalledWith(2, 'activity.position', 'ASC');
      expect(mockQb.addOrderBy).toHaveBeenNthCalledWith(3, 'activity.createdAt', 'ASC');
    });

    it('clamps limit server-side', async () => {
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      repo.createQueryBuilder.mockReturnValue(mockQb as any);

      const highLimitResult = await service.searchForChat(STUDENT_A, { limit: 999 });
      const lowLimitResult = await service.searchForChat(STUDENT_A, { limit: 0 });

      expect(mockQb.limit).toHaveBeenNthCalledWith(1, 10);
      expect(mockQb.limit).toHaveBeenNthCalledWith(2, 1);
      expect(highLimitResult.appliedFilters.limit).toBe(10);
      expect(lowLimitResult.appliedFilters.limit).toBe(1);
    });

    it('rejects invalid date input before querying the database', async () => {
      await expect(
        service.searchForChat(STUDENT_A, {
          deadlineFrom: '2026-99-99',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(repo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('rejects inverted deadline ranges before querying the database', async () => {
      await expect(
        service.searchForChat(STUDENT_A, {
          deadlineFrom: '2026-06-10',
          deadlineTo: '2026-06-01',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(repo.createQueryBuilder).not.toHaveBeenCalled();
    });
  });
});
