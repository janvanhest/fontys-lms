import { Injectable } from '@nestjs/common';
import { ActivityService, SearchActivitiesFilters } from '../../activity/activity.service';
import { ACTIVITY_STATUSES, ACTIVITY_TYPES } from '../../activity/activity.entity';

export const SEARCH_ACTIVITIES_TOOL_DEF = {
  name: 'search_activities',
  description:
    'Zoekt read-only in de activiteiten van de student. Gebruik dit voor vragen over deadlines, open taken, workshops, challenges, competenties of voortgang.',
  input_schema: {
    type: 'object' as const,
    additionalProperties: false,
    properties: {
      query: {
        type: 'string',
        description: 'Vrije tekst voor bredere activiteit-zoekvragen',
      },
      title: {
        type: 'string',
        description: 'Gerichte titelmatch voor een activiteit',
      },
      status: {
        type: 'string',
        description: 'Filter op voortgangsstatus van de activiteit',
        enum: ACTIVITY_STATUSES,
      },
      type: {
        type: 'string',
        description: 'Filter op het soort activiteit',
        enum: ACTIVITY_TYPES,
      },
      deadlineFrom: {
        type: 'string',
        description: 'Inclusieve ondergrens voor deadline in YYYY-MM-DD formaat',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
      deadlineTo: {
        type: 'string',
        description: 'Inclusieve bovengrens voor deadline in YYYY-MM-DD formaat',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      },
      limit: {
        type: 'integer',
        description: 'Maximaal aantal resultaten om terug te geven',
        minimum: 1,
        maximum: 10,
      },
    },
  },
};

@Injectable()
export class SearchActivitiesTool {
  constructor(private readonly activityService: ActivityService) {}

  async execute(studentId: string, input: SearchActivitiesFilters): Promise<string> {
    return JSON.stringify(await this.activityService.searchForChat(studentId, input));
  }
}
