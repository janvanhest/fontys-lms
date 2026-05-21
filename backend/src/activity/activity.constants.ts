import type { ActivityStatus, ActivityType } from './activity.entity';

export const ACTIVITY_TYPES: ActivityType[] = [
  'opdracht',
  'workshop',
  'competentie',
  'eigen activiteit',
  'challenge',
  'coaching',
  'sprint review',
  'semesterplan',
  'posterpresentatie',
  'overdracht',
];

export const ACTIVITY_STATUSES: ActivityStatus[] = ['open', 'bezig', 'feedback', 'afgerond'];
