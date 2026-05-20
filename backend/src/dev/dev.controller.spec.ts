import { Test, TestingModule } from '@nestjs/testing';
import { DevController } from './dev.controller';
import { ActivityService } from '../activity/activity.service';
import { Activity } from '../activity/activity.entity';

const STUDENT_ID = 'student-uuid';
const mockStudent = { id: STUDENT_ID };

const makeActivity = (): Activity => ({
  id: 'act-1',
  studentId: STUDENT_ID,
  portflowId: 7178,
  title: 'Context helder krijgen',
  description: null,
  position: 1,
  type: 'opdracht',
  status: 'open',
  deadline: '2026-03-07',
  competencyLabel: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('DevController', () => {
  let controller: DevController;
  let activityService: jest.Mocked<Pick<ActivityService, 'seed'>>;

  beforeEach(async () => {
    activityService = { seed: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevController],
      providers: [{ provide: ActivityService, useValue: activityService }],
    }).compile();

    controller = module.get<DevController>(DevController);
  });

  it('seed roept activityService.seed aan met studentId en retourneert activiteiten', async () => {
    activityService.seed.mockResolvedValue([makeActivity()]);

    const result = await controller.seedActivities(mockStudent);

    expect(activityService.seed).toHaveBeenCalledWith(STUDENT_ID);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Context helder krijgen');
  });
});
