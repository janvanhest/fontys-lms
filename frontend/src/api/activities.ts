import { queryOptions } from '@tanstack/react-query';
import type { Activity } from '@/types/activity';

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';

export const activitiesQueryOptions = queryOptions({
  queryKey: ['activities'],
  queryFn: async (): Promise<Activity[]> => {
    const res = await fetch(`${apiBase}/activities`);
    if (!res.ok) throw new Error('Kon activiteiten niet ophalen');
    return res.json() as Promise<Activity[]>;
  },
});
