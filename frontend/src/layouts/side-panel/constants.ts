import type { ActivityStatus, ActivityType, GroupKey } from './types';

export const panelWidth = 320;

export const groupMeta: Record<GroupKey, { label: string; rangeLabel: string }> = {
  eerder: { label: 'eerder', rangeLabel: 'vóór deze week' },
  'deze-week': { label: 'deze week', rangeLabel: 'ma t/m zo' },
  'volgende-week': { label: 'volgende week', rangeLabel: 'komende 7 dagen' },
  later: { label: 'later', rangeLabel: 'na volgende week' },
};

export const groupOrder: GroupKey[] = ['eerder', 'deze-week', 'volgende-week', 'later'];

export const statusMeta: Record<ActivityStatus, { color: string; label: string }> = {
  open: { color: '#1976d2', label: 'Open' },
  bezig: { color: '#ed6c02', label: 'Wordt aangewerkt' },
  feedback: { color: '#d32f2f', label: 'Feedback' },
  afgerond: { color: '#2e7d32', label: 'Afgerond' },
};

export const typeLabelMap: Record<ActivityType, string> = {
  opdracht: 'Opdracht',
  workshop: 'Workshop',
  competentie: 'Competentie',
  'eigen activiteit': 'Eigen activiteit',
  challenge: 'Challenge',
  coaching: 'Coaching',
  'sprint review': 'Sprint review',
  semesterplan: 'Semesterplan',
  posterpresentatie: 'Posterpresentatie',
  overdracht: 'Overdracht',
};

export const subtypeOptions = [
  { label: 'Coaching', value: 'coaching' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Sprint review', value: 'sprint review' },
  { label: 'Semesterplan', value: 'semesterplan' },
  { label: 'Posterpresentatie', value: 'posterpresentatie' },
  { label: 'Overdracht', value: 'overdracht' },
] as const satisfies readonly { label: string; value: ActivityType }[];

export type SubtypeOption = (typeof subtypeOptions)[number];

export const statusOptions: ActivityStatus[] = ['open', 'bezig', 'feedback', 'afgerond'];

export function getTypeLabel(activityType: ActivityType) {
  return typeLabelMap[activityType];
}
