export type { ActivityStatus, ActivityType } from '@/types/activity';
import type { Activity } from '@/types/activity';

export type GroupKey = 'eerder' | 'deze-week' | 'volgende-week' | 'later';
export type OpenSubmenu = 'type' | 'status' | null;

export type ActivityGroupSection = {
  groupKey: GroupKey;
  label: string;
  rangeLabel: string;
  items: Activity[];
};
