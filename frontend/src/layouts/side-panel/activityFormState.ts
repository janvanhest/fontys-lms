import type { Activity, ActivityType } from '@/types/activity';

export type ActivityFormState = {
  title: string;
  type: ActivityType;
  description: string;
  deadline: string;
  competencyLabel: string;
};

export function getActivityFormState(activity: Activity | null): ActivityFormState {
  return {
    title: activity?.title ?? '',
    type: activity?.type ?? 'opdracht',
    description: activity?.description ?? '',
    deadline: activity?.deadline ?? '',
    competencyLabel: activity?.competencyLabel ?? '',
  };
}
