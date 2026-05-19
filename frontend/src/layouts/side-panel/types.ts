export type ActivityStatus = 'open' | 'bezig' | 'feedback' | 'afgerond';
export type GroupKey = 'eerder' | 'deze-week' | 'volgende-week' | 'later';
export type OpenSubmenu = 'type' | 'status' | null;
export type ActivityType =
  | 'opdracht'
  | 'workshop'
  | 'competentie'
  | 'eigen activiteit'
  | 'challenge'
  | 'coaching'
  | 'sprint review'
  | 'semesterplan'
  | 'posterpresentatie'
  | 'overdracht';

export type ActivityItem = {
  id: string;
  groupKey: GroupKey;
  type: ActivityType;
  title: string;
  description: string;
  deadlineLabel: string;
  status: ActivityStatus;
  competencyLabel: string;
};

export type ActivityGroupSection = {
  groupKey: GroupKey;
  label: string;
  rangeLabel: string;
  items: ActivityItem[];
};
