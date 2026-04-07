import { QueryAnalysis, SearchResult } from '../search/search.service';

const globalGenerationRules = [
  'Gebruik uitsluitend de aangeleverde context. Verzin geen beleid, deadlines of definities die niet in de context staan.',
  'Als de context onvoldoende is, zeg dat expliciet en blijf eerlijk.',
  'Antwoord altijd in het Nederlands.',
  'Geef eerst direct antwoord op de vraag en blijf compact.',
  'Noem geen bronlabels zoals "Bron 1" in de hoofdtekst.',
  'Neem geen irrelevante details over uit andere chunks.',
  'Schrijf afkortingen alleen uit als de context die afkorting expliciet uitlegt of als de gebruiker daar expliciet om vraagt.',
  'Als een afkorting in de context bekend gebruikt wordt maar niet letterlijk wordt uitgeschreven, behoud dan de afkorting in je antwoord.',
  'Als de gebruiker vraagt wat een afkorting betekent, maar de context geeft geen letterlijke uitgeschreven vorm, beschrijf dan alleen de betekenis in context en schrijf de afkorting niet uit als vaste term.',
];

export function buildGenerationPrompt(analysis: QueryAnalysis, context: string): string {
  return `Je bent een behulpzame studieassistent voor Fontys Pro Open Learning.

${globalGenerationRules.join('\n')}

Gewenste antwoordsvorm:
${getResponseShapeInstructions(analysis)}

Context:
${context}`;
}

export function getResponseShapeInstructions(analysis: QueryAnalysis): string {
  if (analysis.intent === 'summary' && analysis.focusTerms.includes('stappenplan')) {
    return [
      '- Geef precies 4 regels terug met letterlijk de labels "Stap 1:", "Stap 2:", "Stap 3:" en "Stap 4:".',
      '- Houd exact die volgorde aan.',
      '- Houd elke stap bij 1 korte zin.',
      '- Als niet alle stappen voldoende onderbouwd zijn, geef dan een korte algemene samenvatting in maximaal 3 zinnen.',
    ].join('\n');
  }

  if (analysis.intent === 'summary') {
    return [
      '- Geef een korte samenvatting in maximaal 3 zinnen.',
      '- Benoem alleen de kernpunten die direct relevant zijn voor de vraag.',
    ].join('\n');
  }

  if (analysis.intent === 'definition') {
    return [
      '- Geef eerst een directe definitie in 1 zin.',
      '- Voeg daarna hoogstens 1 of 2 korte zinnen toe met relevante toelichting.',
      '- Als de vraag over een afkorting gaat, schrijf die alleen uit als de context dat letterlijk ondersteunt.',
    ].join('\n');
  }

  if (analysis.intent === 'comparison') {
    return [
      '- Vergelijk de twee onderwerpen kort en duidelijk.',
      '- Gebruik maximaal 2 korte alinea’s of 2 korte bullets.',
    ].join('\n');
  }

  return [
    '- Geef een direct antwoord in 2 tot 4 zinnen.',
    '- Begin met het kernantwoord en voeg daarna alleen de relevantste details toe.',
  ].join('\n');
}

export function buildGenerationContext(chunks: SearchResult[]): string {
  return chunks
    .map(
      (chunk, index) =>
        `[Bron ${index + 1}]
Titel: ${chunk.metadata.title}
Bron: ${chunk.metadata.source}
Inhoud:
${chunk.content}`,
    )
    .join('\n\n---\n\n');
}
