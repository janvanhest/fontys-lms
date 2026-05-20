import { groupMeta, groupOrder } from '@/layouts/side-panel/constants';
import type { Activity } from '@/types/activity';
import type { ActivityGroupSection, GroupKey } from '@/layouts/side-panel/types';

export function formatDeadlineLabel(deadline: string | null): string {
  if (!deadline) return '—';
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(deadline));
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function getGroupKey(deadline: string | null, today: Date): GroupKey {
  if (!deadline) return 'later';

  const date = new Date(deadline);
  date.setHours(0, 0, 0, 0);

  const thisMonday = getMondayOfWeek(today);
  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(nextMonday.getDate() + 7);
  const mondayAfterNext = new Date(nextMonday);
  mondayAfterNext.setDate(mondayAfterNext.getDate() + 7);

  if (date < thisMonday) return 'eerder';
  if (date < nextMonday) return 'deze-week';
  if (date < mondayAfterNext) return 'volgende-week';
  return 'later';
}

export function groupActivities(activities: Activity[]): ActivityGroupSection[] {
  const today = new Date();

  const buckets: Record<GroupKey, Activity[]> = {
    eerder: [],
    'deze-week': [],
    'volgende-week': [],
    later: [],
  };

  for (const activity of activities) {
    buckets[getGroupKey(activity.deadline, today)].push(activity);
  }

  return groupOrder
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({
      groupKey: key,
      ...groupMeta[key],
      items: buckets[key],
    }));
}
