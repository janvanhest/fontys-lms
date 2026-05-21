import type { Activity } from '@/types/activity';

// Returns an ISO date string relative to Monday of the current week.
// daysFromMonday=0 → this Monday, -7 → last Monday, 10 → Thursday next week, etc.
function isoDate(daysFromMonday: number): string {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  monday.setDate(monday.getDate() + daysFromMonday);
  return monday.toISOString().split('T')[0];
}

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'activity-1',
    portflowId: 101,
    title: 'Analyseer gebruikerswensen',
    description: 'Inventariseer en analyseer de wensen van de opdrachtgever en beschrijf deze in een requirementsdocument.',
    position: 1,
    type: 'opdracht',
    status: 'afgerond',
    deadline: isoDate(-4), // last Thursday → eerder
    competencyLabel: 'Analyseren',
    createdAt: '2026-05-01T10:00:00Z',
    updatedAt: '2026-05-01T10:00:00Z',
  },
  {
    id: 'activity-2',
    portflowId: 102,
    title: 'Ontwerp low-fidelity prototype',
    description: null,
    position: 2,
    type: 'opdracht',
    status: 'feedback',
    deadline: isoDate(-2), // last Tuesday → eerder
    competencyLabel: null,
    createdAt: '2026-05-02T10:00:00Z',
    updatedAt: '2026-05-02T10:00:00Z',
  },
  {
    id: 'activity-3',
    portflowId: 103,
    title: 'Voer gebruikerstest uit',
    description: 'Voer minstens drie gebruikerstests uit en noteer je bevindingen.',
    position: 3,
    type: 'opdracht',
    status: 'open',
    deadline: isoDate(3), // this Thursday → deze-week
    competencyLabel: 'Onderzoeken',
    createdAt: '2026-05-03T10:00:00Z',
    updatedAt: '2026-05-03T10:00:00Z',
  },
  {
    id: 'activity-4',
    portflowId: null,
    title: 'Workshop ontwerpkeuzes',
    description: 'Werk de ontwerpkeuzes uit en bespreek deze met je coach.',
    position: 4,
    type: 'workshop',
    status: 'open',
    deadline: isoDate(4), // this Friday → deze-week
    competencyLabel: null,
    createdAt: '2026-05-04T10:00:00Z',
    updatedAt: '2026-05-04T10:00:00Z',
  },
  {
    id: 'activity-5',
    portflowId: 105,
    title: 'Coaching gesprek sprint 3',
    description: 'Bespreek voortgang en aandachtspunten voor de volgende sprint.',
    position: 5,
    type: 'coaching',
    status: 'bezig',
    deadline: isoDate(6), // this Sunday → deze-week
    competencyLabel: null,
    createdAt: '2026-05-05T10:00:00Z',
    updatedAt: '2026-05-05T10:00:00Z',
  },
  {
    id: 'activity-6',
    portflowId: 106,
    title: 'Verwerk testbevindingen',
    description: 'Verwerk de bevindingen uit de gebruikerstests en onderbouw je ontwerpkeuzes.',
    position: 6,
    type: 'opdracht',
    status: 'open',
    deadline: isoDate(10), // next Thursday → volgende-week
    competencyLabel: 'Realiseren',
    createdAt: '2026-05-06T10:00:00Z',
    updatedAt: '2026-05-06T10:00:00Z',
  },
  {
    id: 'activity-7',
    portflowId: null,
    title: 'Sprint review presentatie',
    description: null,
    position: 7,
    type: 'sprint review',
    status: 'open',
    deadline: isoDate(11), // next Friday → volgende-week
    competencyLabel: null,
    createdAt: '2026-05-07T10:00:00Z',
    updatedAt: '2026-05-07T10:00:00Z',
  },
  {
    id: 'activity-8',
    portflowId: 108,
    title: 'Posterpresentatie eindresultaat',
    description: 'Presenteer je eindresultaat aan medestudenten en stakeholders.',
    position: 8,
    type: 'posterpresentatie',
    status: 'open',
    deadline: isoDate(18), // two weeks out → later
    competencyLabel: 'Communiceren',
    createdAt: '2026-05-08T10:00:00Z',
    updatedAt: '2026-05-08T10:00:00Z',
  },
];
