import type {
  CompetenceCell,
  CompetenceFramework,
  CompetenceProgress,
  HboiActivity,
  HboiLayer,
} from '@/api/competences';

export const PROFESSIONAL_DEVELOPMENT: HboiLayer = 'Professional Development';

// Kortere, leesbare labels voor de activiteiten.
export const ACTIVITY_LABELS: Record<HboiActivity, string> = {
  Analysis: 'Analyse',
  Advise: 'Advies',
  Design: 'Ontwerp',
  Realisation: 'Realisatie',
  'Manage&Control': 'Beheer & Control',
  'Personal leadership': 'Personal leadership',
  'Professional standard': 'Professional standard',
};

export function cellKey(layer: HboiLayer, activity: HboiActivity): string {
  return `${layer}::${activity}`;
}

// Korte statusregel per competentie. Toont alleen wat echt gezet is, zodat een
// lege competentie niet als "behaald — · doel —" verschijnt.
export function progressStatusText(progress?: CompetenceProgress): string {
  const parts: string[] = [];
  if (typeof progress?.achievedLevel === 'number') {
    parts.push(`behaald niveau ${String(progress.achievedLevel)}`);
  }
  if (typeof progress?.targetLevel === 'number') {
    parts.push(`doel niveau ${String(progress.targetLevel)}`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'Nog niet gestart';
}

// Eén competentie zoals het grid hem toont: de raamwerk-cel met de
// voortgang van de student erbij (kan ontbreken als er nog niks staat).
export type CompetenceItem = {
  layer: HboiLayer;
  activity: HboiActivity;
  label: string;
  cell: CompetenceCell;
  progress?: CompetenceProgress;
};

export type LayerGroup = {
  layer: HboiLayer;
  items: CompetenceItem[];
};

// Groepeert de raamwerk-cellen per laag in de volgorde van het raamwerk, met de
// voortgang van de student eraan gekoppeld. Lagen zonder cellen vallen weg.
export function buildLayerGroups(
  framework: CompetenceFramework,
  progress: CompetenceProgress[],
): LayerGroup[] {
  const progressMap = new Map<string, CompetenceProgress>(
    progress.map((row) => [cellKey(row.layer, row.hboiActivity), row]),
  );
  const order = [...framework.activities, ...framework.professionalDevelopmentAreas];
  const rank = (activity: HboiActivity): number => order.indexOf(activity);

  return framework.layers
    .map((layer) => {
      const items = framework.cells
        .filter((cell) => cell.layer === layer)
        .sort((a, b) => rank(a.hboiActivity) - rank(b.hboiActivity))
        .map<CompetenceItem>((cell) => ({
          layer,
          activity: cell.hboiActivity,
          label: ACTIVITY_LABELS[cell.hboiActivity],
          cell,
          progress: progressMap.get(cellKey(layer, cell.hboiActivity)),
        }));
      return { layer, items };
    })
    .filter((group) => group.items.length > 0);
}
