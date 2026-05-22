import { Test, TestingModule } from '@nestjs/testing';
import { ACTIVITY_STATUSES, ACTIVITY_TYPES } from '../../activity/activity.entity';
import {
  ActivityService,
  SearchActivitiesFilters,
  SearchActivitiesResult,
} from '../../activity/activity.service';
import { SEARCH_ACTIVITIES_TOOL_DEF, SearchActivitiesTool } from './search-activities.tool';

describe('SearchActivitiesTool', () => {
  let tool: SearchActivitiesTool;
  let mockActivityService: jest.Mocked<Pick<ActivityService, 'searchForChat'>>;

  beforeEach(async () => {
    mockActivityService = {
      searchForChat: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchActivitiesTool,
        { provide: ActivityService, useValue: mockActivityService },
      ],
    }).compile();

    tool = module.get<SearchActivitiesTool>(SearchActivitiesTool);
  });

  it('defines the Anthropic tool contract with backend activity enums and input constraints', () => {
    expect(SEARCH_ACTIVITIES_TOOL_DEF.name).toBe('search_activities');
    expect(SEARCH_ACTIVITIES_TOOL_DEF.input_schema.additionalProperties).toBe(false);
    expect(SEARCH_ACTIVITIES_TOOL_DEF.input_schema.properties.status.enum).toEqual(
      ACTIVITY_STATUSES,
    );
    expect(SEARCH_ACTIVITIES_TOOL_DEF.input_schema.properties.type.enum).toEqual(ACTIVITY_TYPES);
    expect(SEARCH_ACTIVITIES_TOOL_DEF.input_schema.properties.deadlineFrom).toMatchObject({
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    });
    expect(SEARCH_ACTIVITIES_TOOL_DEF.input_schema.properties.deadlineTo).toMatchObject({
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
    });
    expect(SEARCH_ACTIVITIES_TOOL_DEF.input_schema.properties.limit).toMatchObject({
      type: 'integer',
      minimum: 1,
      maximum: 10,
    });
  });

  it('serializes the filtered activity result for Anthropic tool_result blocks', async () => {
    const filters: SearchActivitiesFilters = { status: 'open', limit: 99 };
    const serviceResult: SearchActivitiesResult = {
      appliedFilters: {
        query: null,
        title: null,
        status: 'open',
        type: null,
        deadlineFrom: null,
        deadlineTo: null,
        limit: 10,
      },
      activities: [
        {
          id: 'activity-1',
          title: 'Brainstorm',
          type: 'workshop',
          status: 'open',
          deadline: '2026-06-04',
          competencyLabel: null,
          description: null,
        },
      ],
    };
    mockActivityService.searchForChat.mockResolvedValue(serviceResult);

    const result = await tool.execute('student-1', filters);

    expect(mockActivityService.searchForChat).toHaveBeenCalledWith('student-1', filters);
    expect(JSON.parse(result)).toEqual(serviceResult);
  });

  it('returns parseable JSON when no activities match', async () => {
    const filters: SearchActivitiesFilters = { query: 'onbekend' };
    const serviceResult: SearchActivitiesResult = {
      appliedFilters: {
        query: 'onbekend',
        title: null,
        status: null,
        type: null,
        deadlineFrom: null,
        deadlineTo: null,
        limit: 5,
      },
      activities: [],
    };
    mockActivityService.searchForChat.mockResolvedValue(serviceResult);

    const result = await tool.execute('student-1', filters);

    expect(mockActivityService.searchForChat).toHaveBeenCalledWith('student-1', filters);
    expect(JSON.parse(result)).toEqual(serviceResult);
  });
});
