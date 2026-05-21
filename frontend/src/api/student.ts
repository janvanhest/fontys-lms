import { queryOptions } from '@tanstack/react-query';

export interface StudentProfile {
  id: string;
  canvasUserId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';

export const studentProfileOptions = queryOptions({
  queryKey: ['student', 'me'],
  queryFn: async (): Promise<StudentProfile> => {
    const res = await fetch(`${apiBase}/student/me`);
    if (!res.ok) throw new Error('Kon studentprofiel niet ophalen');
    return res.json() as Promise<StudentProfile>;
  },
  staleTime: Infinity,
});

export function studentInitials(displayName: string): string {
  return displayName
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');
}
