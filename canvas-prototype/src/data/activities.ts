import type { ActivityGroup } from '../types';

export const ACTIVITY_GROUPS: ActivityGroup[] = [
  {
    id: 'deze-week',
    label: 'deze week',
    date: '14–18 mrt',
    activities: [
      {
        id: 'act-1',
        tag: 'opdracht',
        title: '[activiteit titel]',
        deadline: 'vr 14 mrt',
        statusKey: 'open',
        status: 'open',
        description:
          '[omschrijving van de opdracht verschijnt hier — wat wordt er van de student verwacht?]',
        competentie: '[gekoppelde competentie]',
        actieLabel: 'Bekijk opdracht',
      },
      {
        id: 'act-2',
        tag: 'workshop',
        title: '[activiteit titel]',
        deadline: 'wo 16 mrt',
        statusKey: 'bezig',
        status: 'aangemeld',
        description:
          '[omschrijving van de workshop — onderwerp, locatie of link, begeleider]',
        competentie: '[gekoppelde competentie]',
        actieLabel: 'Open workshop',
      },
      {
        id: 'act-3',
        tag: 'competentie',
        title: '[activiteit titel]',
        deadline: 'do 17 mrt',
        statusKey: 'feedback',
        status: 'in progress',
        description:
          '[beschrijving van de competentie en wat er nog gedaan moet worden om deze af te ronden]',
        competentie: '[gekoppelde competentie]',
        actieLabel: 'Bekijk voortgang',
      },
    ],
  },
  {
    id: 'volgende-week',
    label: 'volgende week',
    date: '21–25 mrt',
    activities: [
      {
        id: 'act-4',
        tag: 'opdracht',
        title: '[activiteit titel]',
        deadline: 'ma 21 mrt',
        status: 'open',
        description:
          '[omschrijving van de opdracht verschijnt hier — wat wordt er van de student verwacht?]',
        competentie: '[gekoppelde competentie]',
        actieLabel: 'Bekijk opdracht',
      },
      {
        id: 'act-5',
        tag: 'eigen activiteit',
        title: '[activiteit titel]',
        deadline: 'vr 25 mrt',
        statusKey: 'afgerond',
        status: 'open',
        description: '[door de student zelf toegevoegde activiteit — eigen omschrijving]',
        competentie: '[geen koppeling]',
        actieLabel: 'Bewerken',
      },
    ],
  },
  {
    id: 'later',
    label: 'later',
    date: 'na 25 mrt',
    activities: [
      {
        id: 'act-6',
        tag: 'opdracht',
        title: '[activiteit titel]',
        deadline: 'ma 28 mrt',
        status: 'open',
        description:
          '[omschrijving van de opdracht verschijnt hier — wat wordt er van de student verwacht?]',
        competentie: '[gekoppelde competentie]',
        actieLabel: 'Bekijk opdracht',
      },
      {
        id: 'act-7',
        tag: 'workshop',
        title: '[activiteit titel]',
        deadline: 'wo 30 mrt',
        status: 'open',
        description:
          '[omschrijving van de workshop — onderwerp, locatie of link, begeleider]',
        competentie: '[gekoppelde competentie]',
        actieLabel: 'Open workshop',
      },
      {
        id: 'act-8',
        tag: 'competentie',
        title: '[activiteit titel]',
        deadline: 'vr 1 apr',
        status: 'open',
        description:
          '[beschrijving van de competentie en wat er nog gedaan moet worden om deze af te ronden]',
        competentie: '[gekoppelde competentie]',
        actieLabel: 'Bekijk voortgang',
      },
      {
        id: 'act-9',
        tag: 'eigen activiteit',
        title: '[activiteit titel]',
        deadline: 'ma 4 apr',
        status: 'open',
        description: '[door de student zelf toegevoegde activiteit — eigen omschrijving]',
        competentie: '[geen koppeling]',
        actieLabel: 'Bewerken',
      },
      {
        id: 'act-10',
        tag: 'opdracht',
        title: '[activiteit titel]',
        deadline: 'vr 8 apr',
        status: 'open',
        description:
          '[omschrijving van de opdracht verschijnt hier — wat wordt er van de student verwacht?]',
        competentie: '[gekoppelde competentie]',
        actieLabel: 'Bekijk opdracht',
      },
    ],
  },
];
