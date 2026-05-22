import type { HboiActivity, HboiLayer } from './competence-progress.entity';

// De HBO-i lagen en activiteiten. Het volledige raamwerk met beschrijvingen
// staat in de competence_framework-tabel. Dit zijn alleen de toegestane waarden
// (voor validatie) en de volgorde (voor het grid).

export const ARCHITECTURE_LAYERS: HboiLayer[] = [
  'User Interaction',
  'Software',
  'Hardware Interfacing',
  'Infrastructure',
  'Organisational processes',
];

export const PROFESSIONAL_DEVELOPMENT_LAYER: HboiLayer = 'Professional Development';

// Alle lagen, Professional Development eerst (zoals in de competence tool).
export const HBOI_LAYERS: HboiLayer[] = [
  PROFESSIONAL_DEVELOPMENT_LAYER,
  ...ARCHITECTURE_LAYERS,
];

export const HBOI_ACTIVITIES: HboiActivity[] = [
  'Analysis',
  'Advise',
  'Design',
  'Realisation',
  'Manage&Control',
];

export const PROFESSIONAL_DEVELOPMENT_AREAS: HboiActivity[] = [
  'Personal leadership',
  'Professional standard',
];

// Alle geldige waarden voor het activiteit-veld.
export const ALL_HBOI_ACTIVITIES: HboiActivity[] = [
  ...HBOI_ACTIVITIES,
  ...PROFESSIONAL_DEVELOPMENT_AREAS,
];

// Absolute niveaugrenzen voor DTO-validatie. Het exacte bereik per cel staat in
// de competence_framework-tabel.
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 3;
