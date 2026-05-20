import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { Activity } from './activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

const STUDENT_ID = 'student-uuid';
const mockStudent = { id: STUDENT_ID } as any;

const makeActivity = (overrides: Partial<Activity> = {}): Activity => ({
  id: 'act-1',
  studentId: STUDENT_ID,
  portflowId: null,
  title: 'Test',
  description: null,
  position: 0,
  type: 'opdracht',
  status: 'open',
  deadline: null,
  competencyLabel: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('ActivityController', () => {
  let controller: ActivityController;
  let service: jest.Mocked<ActivityService>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<ActivityService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [{ provide: ActivityService, useValue: service }],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
  });

  it('findAll roept service.findAll aan met studentId', async () => {
    service.findAll.mockResolvedValue([makeActivity()]);
    const result = await controller.findAll(mockStudent);
    expect(service.findAll).toHaveBeenCalledWith(STUDENT_ID);
    expect(result).toHaveLength(1);
    expect((result[0] as any).studentId).toBeUndefined();
  });

  it('findOne roept service.findOne aan met id en studentId', async () => {
    service.findOne.mockResolvedValue(makeActivity());
    const result = await controller.findOne('act-1', mockStudent);
    expect(service.findOne).toHaveBeenCalledWith('act-1', STUDENT_ID);
    expect(result.id).toBe('act-1');
    expect((result as any).studentId).toBeUndefined();
  });

  it('create roept service.create aan met studentId en dto', async () => {
    const dto: CreateActivityDto = { title: 'Nieuw', type: 'opdracht' };
    service.create.mockResolvedValue(makeActivity({ title: 'Nieuw' }));
    const result = await controller.create(dto, mockStudent);
    expect(service.create).toHaveBeenCalledWith(STUDENT_ID, dto);
    expect(result.title).toBe('Nieuw');
    expect((result as any).studentId).toBeUndefined();
  });

  it('update roept service.update aan', async () => {
    const dto: UpdateActivityDto = { status: 'bezig' };
    service.update.mockResolvedValue(makeActivity({ status: 'bezig' }));
    const result = await controller.update('act-1', dto, mockStudent);
    expect(service.update).toHaveBeenCalledWith('act-1', STUDENT_ID, dto);
    expect(result.status).toBe('bezig');
    expect((result as any).studentId).toBeUndefined();
  });

  it('remove roept service.remove aan', async () => {
    service.remove.mockResolvedValue(undefined);
    await controller.remove('act-1', mockStudent);
    expect(service.remove).toHaveBeenCalledWith('act-1', STUDENT_ID);
  });
});
