import type { HboiActivity, HboiLayer } from './competence-progress.entity';

// Het HBO-i raamwerk als referentiedata. Een competentie is altijd een
// combinatie van laag x activiteit x niveau. Bron: HBO-i Domeinbeschrijving 2023.

// De vijf reguliere architectuurlagen.
export const ARCHITECTURE_LAYERS: HboiLayer[] = [
  'User Interaction',
  'Organisational Processes',
  'Infrastructure',
  'Software',
  'Hardware Interfacing',
];

// De vijf HBO-i activiteiten die bij elke reguliere laag horen.
export const HBOI_ACTIVITIES: HboiActivity[] = [
  'Analysis',
  'Advise',
  'Design',
  'Realise',
  'Manage & Control',
];

// Professional Development valt buiten de laag-activiteit-matrix en kent twee
// onderdelen die in het raamwerk de plek van een activiteit innemen.
export const PROFESSIONAL_DEVELOPMENT_LAYER: HboiLayer = 'Professional Development';

export const PROFESSIONAL_DEVELOPMENT_AREAS: HboiActivity[] = [
  'Personal Leadership',
  'Professional Standard',
];

// Alle geldige waarden voor het activiteit-veld: de vijf reguliere
// activiteiten plus de twee Professional Development-onderdelen.
export const ALL_HBOI_ACTIVITIES: HboiActivity[] = [
  ...HBOI_ACTIVITIES,
  ...PROFESSIONAL_DEVELOPMENT_AREAS,
];

// Alle lagen, inclusief Professional Development.
export const HBOI_LAYERS: HboiLayer[] = [
  ...ARCHITECTURE_LAYERS,
  PROFESSIONAL_DEVELOPMENT_LAYER,
];

// Maximale niveaus. De reguliere lagen gaan in deze opleiding tot niveau 3
// (het HBO-i raamwerk kent ook niveau 4). Professional Development tot 2.
export const MIN_LEVEL = 1;
export const MAX_LEVEL_REGULAR = 3;
export const MAX_LEVEL_PROFESSIONAL_DEVELOPMENT = 2;

// Eén geldige cel van het raamwerk: een laag-activiteit-combinatie met het
// hoogst toegestane niveau.
export type CompetenceCell = {
  layer: HboiLayer;
  activity: HboiActivity;
  maxLevel: number;
};

// Alle geldige cellen: 5 lagen x 5 activiteiten plus 2 Professional
// Development-onderdelen. Eén bron van waarheid voor validatie en de grid.
export const COMPETENCE_CELLS: CompetenceCell[] = [
  ...ARCHITECTURE_LAYERS.flatMap((layer) =>
    HBOI_ACTIVITIES.map((activity) => ({ layer, activity, maxLevel: MAX_LEVEL_REGULAR })),
  ),
  ...PROFESSIONAL_DEVELOPMENT_AREAS.map((activity) => ({
    layer: PROFESSIONAL_DEVELOPMENT_LAYER,
    activity,
    maxLevel: MAX_LEVEL_PROFESSIONAL_DEVELOPMENT,
  })),
];

// Zoekt de geldige cel voor een laag-activiteit-combinatie, of undefined als
// die combinatie niet in het raamwerk bestaat.
export function findCompetenceCell(
  layer: HboiLayer,
  activity: HboiActivity,
): CompetenceCell | undefined {
  return COMPETENCE_CELLS.find((cell) => cell.layer === layer && cell.activity === activity);
}
