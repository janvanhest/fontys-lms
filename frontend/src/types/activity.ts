export type ActivityStatus = 'open' | 'bezig' | 'feedback' | 'afgerond';

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

export type Activity = {
  id: string;
  portflowId: number | null;
  title: string;
  description: string | null;
  position: number;
  type: ActivityType;
  status: ActivityStatus;
  deadline: string | null;
  competencyLabel: string | null;
  createdAt: string;
  updatedAt: string;
};
