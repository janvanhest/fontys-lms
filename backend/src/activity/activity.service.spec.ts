import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

const STUDENT_A = 'student-a-uuid';
const STUDENT_B = 'student-b-uuid';

const makeActivity = (overrides: Partial<Activity> = {}): Activity =>
  ({
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
  }) as Activity;

describe('ActivityService', () => {
  let service: ActivityService;
  let repo: jest.Mocked<Pick<Repository<Activity>, 'find' | 'findOne' | 'create' | 'save' | 'delete'>>;

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: getRepositoryToken(Activity), useValue: repo },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  describe('findAll', () => {
    it('returns activities for the student sorted by deadline then position', async () => {
      const activities = [makeActivity({ id: 'a1' }), makeActivity({ id: 'a2' })];
      repo.find.mockResolvedValue(activities);

      const result = await service.findAll(STUDENT_A);

      expect(repo.find).toHaveBeenCalledWith({
        where: { studentId: STUDENT_A },
        order: { deadline: { direction: 'ASC', nulls: 'LAST' }, position: 'ASC' },
      });
      expect(result).toEqual(activities);
    });
  });

  describe('findOne', () => {
    it('returns the activity when it belongs to the student', async () => {
      const activity = makeActivity();
      repo.findOne.mockResolvedValue(activity);

      const result = await service.findOne('act-uuid-1', STUDENT_A);

      expect(result).toEqual(activity);
    });

    it('throws NotFoundException when activity does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id', STUDENT_A)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when activity belongs to a different student', async () => {
      repo.findOne.mockResolvedValue(makeActivity({ studentId: STUDENT_B }));

      await expect(service.findOne('act-uuid-1', STUDENT_A)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and saves an activity for the student', async () => {
      const dto: CreateActivityDto = { title: 'Nieuwe activiteit', type: 'workshop' };
      const created = makeActivity({ title: 'Nieuwe activiteit', type: 'workshop' });
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      const result = await service.create(STUDENT_A, dto);

      expect(repo.create).toHaveBeenCalledWith({ ...dto, studentId: STUDENT_A, position: 0, status: 'open' });
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

    it('throws NotFoundException when activity does not belong to student', async () => {
      repo.findOne.mockResolvedValue(makeActivity({ studentId: STUDENT_B }));

      await expect(service.update('act-uuid-1', STUDENT_A, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the activity when it belongs to the student', async () => {
      repo.findOne.mockResolvedValue(makeActivity());

      await service.remove('act-uuid-1', STUDENT_A);

      expect(repo.delete).toHaveBeenCalledWith('act-uuid-1');
    });

    it('throws NotFoundException when activity does not belong to student', async () => {
      repo.findOne.mockResolvedValue(makeActivity({ studentId: STUDENT_B }));

      await expect(service.remove('act-uuid-1', STUDENT_A)).rejects.toThrow(NotFoundException);
    });
  });

  describe('seed', () => {
    it('verwijdert bestaande activiteiten en maakt 10 nieuwe aan', async () => {
      repo.delete.mockResolvedValue({ affected: 5, raw: [] });
      repo.create.mockImplementation((data) => data as Activity);
      repo.save.mockImplementation(async (data) => data as Activity);

      const results = await service.seed(STUDENT_A);

      expect(repo.delete).toHaveBeenCalledWith({ studentId: STUDENT_A });
      expect(results).toHaveLength(10);
    });
  });
});
