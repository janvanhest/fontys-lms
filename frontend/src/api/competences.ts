import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';

// HBO-i architectuurlagen. 'Professional Development' is de uitzondering: die kent
// geen activiteiten-uitsplitsing maar Personal Leadership / Professional Standard.
export type HboiLayer =
  | 'User Interaction'
  | 'Organisational processes'
  | 'Infrastructure'
  | 'Software'
  | 'Hardware Interfacing'
  | 'Professional Development';

// De vijf HBO-i activiteiten plus de twee Professional Development-onderdelen die
// in het raamwerk de plek van een activiteit innemen.
export type HboiActivity =
  | 'Analysis'
  | 'Advise'
  | 'Design'
  | 'Realisation'
  | 'Manage&Control'
  | 'Personal leadership'
  | 'Professional standard';

// GET /competences: de voortgang van de student op één cel (laag x activiteit).
// achievedLevel = al behaald, targetLevel = gekozen doel. Beide mogen leeg zijn.
export interface CompetenceProgress {
  id: string;
  layer: HboiLayer;
  hboiActivity: HboiActivity;
  achievedLevel: number | null;
  targetLevel: number | null;
  explanation: string | null;
  createdAt: string;
  updatedAt: string;
}

// Eén niveau binnen een cel, met de officiele HBO-i beschrijving.
export interface CompetenceLevel {
  level: number;
  description: string;
}

// GET /competences/framework: één cel van het raamwerk met de niveaus die daar
// bestaan. Statisch, gelijk voor elke student.
export interface CompetenceCell {
  layer: HboiLayer;
  hboiActivity: HboiActivity;
  minLevel: number;
  maxLevel: number;
  levels: CompetenceLevel[];
}

// De volledige raamwerkstructuur die de frontend nodig heeft om het grid te tekenen.
export interface CompetenceFramework {
  layers: HboiLayer[];
  activities: HboiActivity[];
  professionalDevelopmentAreas: HboiActivity[];
  cells: CompetenceCell[];
}

// PUT /competences: behaald en/of gekozen niveau voor één cel zetten. Een
// weggelaten of null-niveau betekent dat de student daar nog niks heeft staan.
export interface SetCompetenceDto {
  layer: HboiLayer;
  hboiActivity: HboiActivity;
  achievedLevel?: number | null;
  targetLevel?: number | null;
  explanation?: string | null;
}

export const competencesQueryOptions = queryOptions({
  queryKey: ['competences'],
  queryFn: async (): Promise<CompetenceProgress[]> => {
    const res = await fetch(`${apiBase}/competences`);
    if (!res.ok) throw new Error('Kon competentievoortgang niet ophalen');
    return res.json() as Promise<CompetenceProgress[]>;
  },
});

export const competenceFrameworkQueryOptions = queryOptions({
  queryKey: ['competences', 'framework'],
  queryFn: async (): Promise<CompetenceFramework> => {
    const res = await fetch(`${apiBase}/competences/framework`);
    if (!res.ok) throw new Error('Kon het competentieraamwerk niet ophalen');
    return res.json() as Promise<CompetenceFramework>;
  },
  staleTime: Infinity,
});

export function useSetCompetence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: SetCompetenceDto): Promise<CompetenceProgress> => {
      const res = await fetch(`${apiBase}/competences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      if (!res.ok) throw new Error(`${String(res.status)} ${res.statusText}`.trim());
      return res.json() as Promise<CompetenceProgress>;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: competencesQueryOptions.queryKey });
    },
  });
}
