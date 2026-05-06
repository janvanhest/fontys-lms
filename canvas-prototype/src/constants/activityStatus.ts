import type { ActivityStatusKey } from '../types';

export const STATUS_COLORS: Record<ActivityStatusKey, string> = {
  open: '#1976d2',
  bezig: '#ed6c02',
  feedback: '#d32f2f',
  afgerond: '#2e7d32',
};

export const STATUS_LABELS: Record<ActivityStatusKey, string> = {
  open: 'Open',
  bezig: 'Wordt aangewerkt',
  feedback: 'Feedback',
  afgerond: 'Afgerond',
};

export const STATUSES = Object.keys(STATUS_COLORS) as ActivityStatusKey[];

export const ACTIVITY_TYPES = [
  'Coaching',
  'Workshop',
  'Sprint review',
  'Semesterplan',
  'Posterpresentatie',
  'Overdracht',
] as const;
