export interface StudyPlanLink {
  title: string;
  description: string;
  href: string;
}

export interface StudyPlanStep {
  id: string;
  number: string;
  title: string;
  description: string;
  links: StudyPlanLink[];
}

export const STUDY_PLAN_INTRO =
  'In Pro Open Learning bepaal jij zelf wat je wilt leren en hoe je dat doet. Dit stappenplan helpt je om gestructureerd te starten. Volg de stappen in je eigen tempo, maar vergeet niet: planning en begeleiding zijn essentieel voor succes.';

export const STUDY_PLAN_STEPS: StudyPlanStep[] = [
  {
    id: 'goals',
    number: '1',
    title: 'Wat zijn je doelen dit semester?',
    description:
      'Begin met het bepalen waar je aan wilt werken. Welke HBO-i competenties wil je ontwikkelen? Welke leeruitkomsten passen bij jouw ambities?',
    links: [
      {
        title: 'Waar ga je aan werken?',
        description:
          'Verken de mogelijkheden en kies je focus voor dit semester.',
        href: 'https://fhict.instructure.com/courses/15737/pages/waar-ga-je-aan-werken',
      },
    ],
  },
  {
    id: 'needs',
    number: '2',
    title: 'Wat heb je daarvoor nodig?',
    description:
      'Kies een passend project of challenge die aansluit bij jouw leeruitkomsten. Je kunt kiezen tussen een groepschallenge of individueel project.',
    links: [
      {
        title: 'Groepschallenge',
        description:
          'Werk samen met medestudenten aan een realistische opdracht van een externe opdrachtgever.',
        href: 'https://fhict.instructure.com/courses/15737/pages/groepschallenge',
      },
      {
        title: 'Individueel project',
        description:
          'Werk zelfstandig aan een eigen project dat past bij jouw ambities.',
        href: 'https://fhict.instructure.com/courses/15737/pages/individueel-project',
      },
    ],
  },
  {
    id: 'approach',
    number: '3',
    title: 'Hoe ga je dat dan doen?',
    description:
      'Splits je project op in hanteerbare leeractiviteiten en zorg dat de complexiteit past bij je niveau. Dit zijn cruciale stappen voor succesvolle uitvoering.',
    links: [
      {
        title: 'Challenge opsplitsen in leeractiviteiten',
        description:
          'Leer hoe je een groot project opdeelt in concrete, uitvoerbare stappen.',
        href: 'https://fhict.instructure.com/courses/15737/pages/challenge-opsplitsen-in-leeractiviteiten',
      },
      {
        title: 'De juiste complexiteit borgen',
        description:
          'Zorg dat je werk uitdagend is, maar niet overweldigend. Leer hoe je het juiste niveau vindt.',
        href: 'https://fhict.instructure.com/courses/15737/pages/de-juiste-complexiteit-borgen-2',
      },
    ],
  },
  {
    id: 'visibility',
    number: '4',
    title: 'Hoe maak je alles inzichtelijk voor het semester?',
    description:
      'Maak je plannen concreet en zorg voor goede documentatie. Deze tools en methoden helpen je om overzicht te houden en vooruitgang te meten.',
    links: [
      {
        title: 'Agile werken',
        description:
          'Leer werken in sprints, met korte cyclussen van planning, uitvoering en reflectie.',
        href: 'https://fhict.instructure.com/courses/15737/pages/agile-werken',
      },
      {
        title: 'Leeruitkomsten in Pro Open Learning',
        description:
          'Begrijp hoe leeruitkomsten werken en hoe je deze gebruikt om je voortgang te documenteren.',
        href: 'https://fhict.instructure.com/courses/15737/pages/leeruitkomsten-in-pro-open-learning',
      },
      {
        title: 'Portflow bij Fontys ICT',
        description:
          'Documenteer je werk en bewijs je competenties via het digitale portfolio.',
        href: 'https://fhict.instructure.com/courses/15737/pages/portflow-bij-fontys-ict',
      },
      {
        title: 'Reflectievragen voor Documentatie',
        description:
          'Kritisch kijken naar wat je documenteert en waarom. Deze vragen helpen je bepalen of je leerproduct echt waarde toevoegt.',
        href: 'https://fhict.instructure.com/courses/15737/pages/reflectievragen-voor-documentatie',
      },
      {
        title: 'Persoonlijk Semesterplan',
        description:
          'Maak een concreet plan voor het hele semester met deadlines en mijlpalen.',
        href: 'https://fhict.instructure.com/courses/15737/pages/persoonlijk-semesterplan',
      },
    ],
  },
];

export const STUDY_PLAN_CTA = {
  title: 'Start nu',
  description:
    'Wacht niet tot je alles perfect hebt uitgedacht. Begin met stap 1, maak keuzes, en verfijn onderweg. Gebruik je coach om feedback te krijgen en bij te sturen waar nodig.',
  href: 'https://fhict.instructure.com/courses/15737/pages/homepage',
  label: 'Terug naar Homepage',
};
