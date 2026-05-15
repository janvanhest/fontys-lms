export interface DomainConceptConfig {
  canonical: string;
  aliases: string[];
  preferredTerms: string[];
  titleHints: string[];
}

export interface DomainExpansion {
  matchedConcepts: string[];
  expandedTerms: string[];
  titleHints: string[];
}

const domainConcepts: DomainConceptConfig[] = [
  {
    canonical: 'persoonlijke ontwikkeling',
    aliases: ['po', 'persoonlijke ontwikkeling'],
    preferredTerms: ['persoonlijke ontwikkeling', 'inhoud en po', 'wanneer is po verplicht'],
    titleHints: ['Inhoud en PO: twee kanten van hetzelfde verhaal', 'Wanneer is PO verplicht?'],
  },
  {
    canonical: 'persoonlijk semesterplan',
    aliases: ['semesterplan', 'persoonlijk semesterplan', 'psp'],
    preferredTerms: ['persoonlijk semesterplan', 'semesterplan', 'kernvragen semesterplan'],
    titleHints: ['Introductie Persoonlijk Semesterplan', 'Kernvragen Semesterplan', 'Richtlijnen Semesterplan'],
  },
  {
    canonical: 'stappenplan',
    aliases: ['stappenplan', 'stap 1', 'stap 2', 'stap 3', 'stap 4'],
    preferredTerms: ['stappenplan', 'stap 1', 'stap 2', 'stap 3', 'stap 4'],
    titleHints: [
      'Introductie Stappenplan',
      'Stap 1: Wat zijn je doelen dit semester?',
      'Stap 2: Wat heb je daarvoor nodig?',
      'Stap 3: Hoe ga je dat dan doen?',
      'Stap 4: Hoe maak je alles inzichtelijk voor het semester?',
    ],
  },
  {
    canonical: 'portflow',
    aliases: ['portflow'],
    preferredTerms: ['portflow', 'portfolio'],
    titleHints: ['Introductie Portflow', 'Portfolio aanmaken', 'Structuur van je portfolio'],
  },
  {
    canonical: 'groepschallenge',
    aliases: ['groepschallenge', 'challenge'],
    preferredTerms: ['groepschallenge', 'challenge'],
    titleHints: ['Introductie Groepschallenge', 'Wat is een challenge?', 'Richtlijnen groepschallenge'],
  },
  {
    canonical: 'individueel project',
    aliases: ['individueel project', 'individueel'],
    preferredTerms: ['individueel project'],
    titleHints: ['Introductie Individueel project', 'Eisen aan individueel project'],
  },
];

function hasAlias(normalized: string, alias: string): boolean {
  const haystack = ` ${normalized} `;
  const needle = ` ${alias.toLowerCase()} `;
  return haystack.includes(needle);
}

export function expandDomainTerms(normalized: string, tokens: string[]): DomainExpansion {
  const matchedConcepts: string[] = [];
  const expandedTerms = new Set<string>(tokens);
  const titleHints = new Set<string>();

  for (const concept of domainConcepts) {
    const matched = concept.aliases.some((alias) => hasAlias(normalized, alias));

    if (!matched) {
      continue;
    }

    matchedConcepts.push(concept.canonical);
    expandedTerms.add(concept.canonical);

    for (const term of concept.preferredTerms) {
      expandedTerms.add(term.toLowerCase());
    }

    for (const title of concept.titleHints) {
      titleHints.add(title);
    }
  }

  return {
    matchedConcepts,
    expandedTerms: [...expandedTerms],
    titleHints: [...titleHints],
  };
}
