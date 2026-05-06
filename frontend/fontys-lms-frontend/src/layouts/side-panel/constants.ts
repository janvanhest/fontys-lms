import type { ActivityItem, ActivityStatus, ActivityType, GroupKey } from './types'

export const panelWidth = 320

export const groupMeta: Record<GroupKey, { label: string; rangeLabel: string }> = {
  eerder: { label: 'eerder', rangeLabel: 'vóór 14 mrt' },
  'deze-week': { label: 'deze week', rangeLabel: '14–18 mrt' },
  'volgende-week': { label: 'volgende week', rangeLabel: '21–25 mrt' },
  later: { label: 'later', rangeLabel: 'na 25 mrt' },
}

export const groupOrder: GroupKey[] = ['eerder', 'deze-week', 'volgende-week', 'later']

export const statusMeta: Record<ActivityStatus, { color: string; label: string }> = {
  open: { color: '#1976d2', label: 'Open' },
  bezig: { color: '#ed6c02', label: 'Wordt aangewerkt' },
  feedback: { color: '#d32f2f', label: 'Feedback' },
  afgerond: { color: '#2e7d32', label: 'Afgerond' },
}

export const typeLabelMap: Record<ActivityType, string> = {
  opdracht: 'Opdracht',
  workshop: 'Workshop',
  competentie: 'Competentie',
  'eigen activiteit': 'Eigen activiteit',
  challenge: 'Challenge',
  coaching: 'Coaching',
  'sprint review': 'Sprint review',
  semesterplan: 'Semesterplan',
  posterpresentatie: 'Posterpresentatie',
  overdracht: 'Overdracht',
}

export const subtypeOptions = [
  { label: 'Coaching', value: 'coaching' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Sprint review', value: 'sprint review' },
  { label: 'Semesterplan', value: 'semesterplan' },
  { label: 'Posterpresentatie', value: 'posterpresentatie' },
  { label: 'Overdracht', value: 'overdracht' },
] as const satisfies readonly { label: string; value: ActivityType }[]

export type SubtypeOption = (typeof subtypeOptions)[number]

export const statusOptions: ActivityStatus[] = ['open', 'bezig', 'feedback', 'afgerond']

// Afgeleid uit de gebruikersbeschrijving:
// - groepen en range-labels zijn expliciet
// - "eerder" bevat twee afgeronde challenge-items met echte titels
// - overige titels/beschrijvingen blijven placeholders
// - deadlines zijn specifiek, maar behalve voorbeelden niet volledig gespecificeerd
export const initialActivities: ActivityItem[] = [
  {
    id: 'challenge-markering',
    groupKey: 'eerder',
    type: 'challenge',
    title: 'Challenge markering',
    description: '[omschrijving van de opdracht...]',
    deadlineLabel: 'vr 11 mrt',
    status: 'afgerond',
    competencyLabel: '[gekoppelde competentie]',
  },
  {
    id: 'gekozen-challenge',
    groupKey: 'eerder',
    type: 'challenge',
    title: 'Gekozen challenge',
    description: '[omschrijving van de opdracht...]',
    deadlineLabel: 'zo 13 mrt',
    status: 'afgerond',
    competencyLabel: '[gekoppelde competentie]',
  },
  {
    id: 'opdracht-open',
    groupKey: 'deze-week',
    type: 'opdracht',
    title: '[activiteit titel]',
    description: '[omschrijving van de opdracht...]',
    deadlineLabel: 'vr 14 mrt',
    status: 'open',
    competencyLabel: '[gekoppelde competentie]',
  },
  {
    id: 'workshop-bezig',
    groupKey: 'deze-week',
    type: 'workshop',
    title: '[activiteit titel]',
    description: '[omschrijving van de workshop...]',
    deadlineLabel: 'wo 16 mrt',
    status: 'bezig',
    competencyLabel: '[gekoppelde competentie]',
  },
  {
    id: 'competentie-feedback',
    groupKey: 'volgende-week',
    type: 'competentie',
    title: '[activiteit titel]',
    description: '[omschrijving van de competentie-activiteit...]',
    deadlineLabel: 'di 22 mrt',
    status: 'feedback',
    competencyLabel: '[gekoppelde competentie]',
  },
  {
    id: 'eigen-activiteit-open',
    groupKey: 'volgende-week',
    type: 'eigen activiteit',
    title: '[activiteit titel]',
    description: '[omschrijving van de eigen activiteit...]',
    deadlineLabel: 'vr 25 mrt',
    status: 'open',
    competencyLabel: '[gekoppelde competentie]',
  },
  {
    id: 'later-opdracht',
    groupKey: 'later',
    type: 'opdracht',
    title: '[activiteit titel]',
    description: '[omschrijving van de opdracht...]',
    deadlineLabel: 'ma 28 mrt',
    status: 'bezig',
    competencyLabel: '[gekoppelde competentie]',
  },
]

export function getTypeLabel(activityType: ActivityType) {
  return typeLabelMap[activityType]
}

export function getActionLabel(activityType: ActivityType) {
  switch (activityType) {
    case 'opdracht':
      return 'Bekijk opdracht'
    case 'workshop':
      return 'Open workshop'
    case 'competentie':
      return 'Bekijk voortgang'
    case 'challenge':
      return 'Bekijk challenge'
    default:
      return 'Bewerken'
  }
}
