import type { QueryIntent } from './search.service';

export interface RetrievalEvalCase {
  query: string;
  expectedTopTitles: string[];
  expectedTopSources?: string[];
  disallowedTitles?: string[];
  expectedIntent?: QueryIntent;
}

export const retrievalEvalCases: RetrievalEvalCase[] = [
  {
    query: 'Wat is PO?',
    expectedTopTitles: ['Wanneer is PO verplicht?', 'Inhoud en PO: twee kanten van hetzelfde verhaal'],
    disallowedTitles: ['Introductie Portflow'],
    expectedIntent: 'definition',
  },
  {
    query: 'Wanneer is PO verplicht?',
    expectedTopTitles: ['Wanneer is PO verplicht?'],
    expectedIntent: 'specific',
  },
  {
    query: 'Wat is persoonlijke ontwikkeling?',
    expectedTopTitles: ['Kernvragen Semesterplan', 'Inhoud en PO: twee kanten van hetzelfde verhaal'],
    expectedIntent: 'definition',
  },
  {
    query: 'Wat moet er in een semesterplan staan?',
    expectedTopTitles: ['Kernvragen Semesterplan', 'Introductie Persoonlijk Semesterplan'],
    expectedIntent: 'specific',
  },
  {
    query: 'Vat het stappenplan samen in 4 korte stappen',
    expectedTopTitles: [
      'Stap 1: Wat zijn je doelen dit semester?',
      'Stap 2: Wat heb je daarvoor nodig?',
      'Stap 3: Hoe ga je dat dan doen?',
      'Stap 4: Hoe maak je alles inzichtelijk voor het semester?',
    ],
    expectedIntent: 'summary',
  },
  {
    query: 'Wat is Portflow?',
    expectedTopTitles: ['Introductie Portflow'],
    disallowedTitles: ['Introductie Stappenplan'],
    expectedIntent: 'definition',
  },
  {
    query: 'Wat is een groepschallenge?',
    expectedTopTitles: ['Wat is een challenge?', 'Introductie Groepschallenge'],
    expectedIntent: 'definition',
  },
  {
    query: 'Hoe werkt studiefinanciering?',
    expectedTopTitles: [],
    expectedIntent: 'unknown',
  },
  {
    query: 'Welke stappen zijn er?',
    expectedTopTitles: [],
    expectedIntent: 'specific',
  },
];
