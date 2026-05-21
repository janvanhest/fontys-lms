import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Activity, ActivityStatus, ActivityType } from '@/types/activity';

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';

export type CreateActivityDto = {
  title: string;
  type: ActivityType;
  description?: string;
  deadline?: string;
  competencyLabel?: string;
};

export type UpdateActivityDto = {
  title?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  description?: string;
  deadline?: string;
  competencyLabel?: string;
};

export const activitiesQueryOptions = queryOptions({
  queryKey: ['activities'],
  queryFn: async (): Promise<Activity[]> => {
    const res = await fetch(`${apiBase}/activities`);
    if (!res.ok) throw new Error('Kon activiteiten niet ophalen');
    return res.json() as Promise<Activity[]>;
  },
});

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateActivityDto): Promise<Activity> => {
      const res = await fetch(`${apiBase}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`.trim());
      return res.json() as Promise<Activity>;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: activitiesQueryOptions.queryKey });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...dto }: { id: string } & UpdateActivityDto): Promise<Activity> => {
      const res = await fetch(`${apiBase}/activities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`.trim());
      return res.json() as Promise<Activity>;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: activitiesQueryOptions.queryKey });
    },
  });
}

export function useRemoveActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const res = await fetch(`${apiBase}/activities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`.trim());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: activitiesQueryOptions.queryKey });
    },
  });
}
