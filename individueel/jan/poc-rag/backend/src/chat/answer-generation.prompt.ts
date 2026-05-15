import { QueryAnalysis, SearchResult } from '../search/search.service';
import { ConversationContext } from './conversation-context.service';

const globalGenerationRules = [
  'Gebruik uitsluitend de aangeleverde context. Verzin geen beleid, deadlines of definities die niet in de context staan.',
  'Als de context onvoldoende is, zeg dat expliciet en blijf eerlijk.',
  'Antwoord altijd in het Nederlands.',
  'Geef eerst direct antwoord op de vraag.',
  'Geef daarna meestal een korte verdiepende toelichting of een concreet voorbeeld als de context dat ondersteunt.',
  'Noem geen bronlabels zoals "Bron 1" in de hoofdtekst.',
  'Neem geen irrelevante details over uit andere chunks.',
  'Schrijf afkortingen alleen uit als de context die afkorting expliciet uitlegt of als de gebruiker daar expliciet om vraagt.',
  'Als een afkorting in de context bekend gebruikt wordt maar niet letterlijk wordt uitgeschreven, behoud dan de afkorting in je antwoord.',
  'Als de gebruiker vraagt wat een afkorting betekent, maar de context geeft geen letterlijke uitgeschreven vorm, beschrijf dan alleen de betekenis in context en schrijf de afkorting niet uit als vaste term.',
];

export function buildGenerationPrompt(
  analysis: QueryAnalysis,
  context: string,
  conversationContext: ConversationContext,
): string {
  return `Je bent een behulpzame studieassistent voor Fontys Pro Open Learning.

${globalGenerationRules.join('\n')}

Gesprekscontext:
- Oorspronkelijke vraag: ${conversationContext.originalQuestion}
- Geherformuleerde vraag voor retrieval: ${conversationContext.resolvedQuestion}
- Actief onderwerp: ${conversationContext.activeTopic}
- Actief subonderwerp: ${conversationContext.activeSubtopic ?? 'geen'}
- Toonhint: ${conversationContext.toneHint ?? 'geen'}
- Follow-up vraag: ${conversationContext.isFollowUp ? 'ja' : 'nee'}

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
      '- Geef een korte maar complete samenvatting in 3 tot 5 zinnen.',
      '- Benoem eerst de kernpunten en voeg daarna kort toe waarom dit relevant is of hoe het gebruikt wordt, als de context dat ondersteunt.',
    ].join('\n');
  }

  if (analysis.intent === 'definition') {
    return [
      '- Geef eerst een directe definitie in 1 zin.',
      '- Voeg daarna 2 of 3 korte zinnen toe met relevante toelichting, betekenis in de praktijk of een klein voorbeeld.',
      '- Als de vraag over een afkorting gaat, schrijf die alleen uit als de context dat letterlijk ondersteunt.',
    ].join('\n');
  }

  if (analysis.intent === 'comparison') {
    return [
      '- Vergelijk de twee onderwerpen kort en duidelijk.',
      '- Gebruik 2 korte alinea’s of 2 korte bullets.',
      '- Benoem niet alleen het verschil, maar ook kort wanneer elk van beide relevant is, als de context dat ondersteunt.',
    ].join('\n');
  }

  return [
    '- Geef eerst een direct antwoord in 1 of 2 zinnen.',
    '- Voeg daarna nog 2 of 3 zinnen toe met de belangrijkste verdieping, reden of praktische betekenis.',
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
