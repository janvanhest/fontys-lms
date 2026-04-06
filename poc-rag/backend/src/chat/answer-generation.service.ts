import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

import { QueryAnalysis, SearchResult } from '../search/search.service';
import { HistoryItemDto } from './dto/chat-message.dto';

type GenerationMode = 'anthropic' | 'fallback';

interface GenerateAnswerInput {
  question: string;
  history: HistoryItemDto[];
  analysis: QueryAnalysis;
  chunks: SearchResult[];
}

interface GenerateAnswerResult {
  answer: string;
  mode: GenerationMode;
}

@Injectable()
export class AnswerGenerationService {
  private readonly logger = new Logger(AnswerGenerationService.name);
  private readonly anthropicKey: string;

  constructor(private readonly configService: ConfigService) {
    this.anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY', '');
  }

  async generate(input: GenerateAnswerInput): Promise<GenerateAnswerResult> {
    if (!this.anthropicKey) {
      return {
        answer: this.generateFallback(input.chunks, input.analysis),
        mode: 'fallback',
      };
    }

    try {
      const answer = await this.generateWithAnthropic(input);

      if (answer.length > 0) {
        return { answer, mode: 'anthropic' };
      }

      this.logger.warn('Anthropic gaf een leeg antwoord terug, lokale fallback-response wordt gebruikt.');
    } catch (error) {
      this.logger.warn(
        `Anthropic request mislukt, lokale fallback-response wordt gebruikt: ${
          error instanceof Error ? error.message : 'onbekende fout'
        }`,
      );
    }

    return {
      answer: this.generateFallback(input.chunks, input.analysis),
      mode: 'fallback',
    };
  }

  private async generateWithAnthropic(input: GenerateAnswerInput): Promise<string> {
    const client = new Anthropic({ apiKey: this.anthropicKey });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: this.buildSystemPrompt(input.analysis, this.buildContext(input.chunks)),
      messages: [
        ...this.toAnthropicMessages(input.history),
        { role: 'user', content: input.question },
      ],
    });

    return response.content
      .filter((item): item is Anthropic.TextBlock => item.type === 'text')
      .map((item) => item.text)
      .join('\n')
      .trim();
  }

  private toAnthropicMessages(history: HistoryItemDto[]): Anthropic.MessageParam[] {
    return history.map((item) => ({
      role: item.role,
      content: item.content,
    }));
  }

  private buildSystemPrompt(analysis: QueryAnalysis, context: string): string {
    return `Je bent een behulpzame studieassistent voor Fontys Pro Open Learning.

Gebruik uitsluitend de aangeleverde context. Verzin geen beleid, deadlines of definities die niet in de context staan.
Als de context onvoldoende is, zeg dat expliciet en blijf eerlijk.
Antwoord altijd in het Nederlands.
Geef eerst direct antwoord op de vraag en blijf compact.
Noem geen bronlabels zoals "Bron 1" in de hoofdtekst.
Neem geen irrelevante details over uit andere chunks.
Schrijf afkortingen alleen uit als de context die afkorting expliciet uitlegt of als de gebruiker daar expliciet om vraagt.
Als een afkorting in de context bekend gebruikt wordt maar niet letterlijk wordt uitgeschreven, behoud dan de afkorting in je antwoord.

Gewenste antwoordsvorm:
${this.getResponseShape(analysis)}

Context:
${context}`;
  }

  private getResponseShape(analysis: QueryAnalysis): string {
    if (analysis.intent === 'summary' && analysis.focusTerms.includes('stappenplan')) {
      return [
        '- Geef precies 4 korte genummerde stappen als de context stap 1 t/m 4 ondersteunt.',
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

  private buildContext(chunks: SearchResult[]): string {
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

  private generateFallback(chunks: SearchResult[], analysis: QueryAnalysis): string {
    if (analysis.intent === 'summary' && analysis.focusTerms.includes('stappenplan')) {
      return this.buildStepSummary(chunks);
    }

    if (analysis.intent === 'comparison') {
      return this.buildComparisonAnswer(chunks);
    }

    if (analysis.intent === 'definition') {
      return this.buildDefinitionAnswer(chunks);
    }

    return this.buildSpecificAnswer(chunks);
  }

  private buildStepSummary(chunks: SearchResult[]): string {
    const orderedSteps = chunks
      .filter((chunk) => /Stap [1-4]:/i.test(chunk.metadata.title))
      .sort((a, b) => this.extractStepNumber(a.metadata.title) - this.extractStepNumber(b.metadata.title));

    if (orderedSteps.length < 3) {
      return this.buildSpecificAnswer(chunks);
    }

    return orderedSteps
      .map((chunk) => `${this.extractStepNumber(chunk.metadata.title)}. ${this.summarizeChunk(chunk.content, 1)}`)
      .join('\n');
  }

  private buildDefinitionAnswer(chunks: SearchResult[]): string {
    const primary = chunks[0];

    if (!primary) {
      return '';
    }

    const primarySummary = this.summarizeChunk(primary.content, 2);
    const supporting = chunks
      .slice(1)
      .map((chunk) => this.summarizeChunk(chunk.content, 1))
      .find((summary) => summary.length > 0 && !primarySummary.includes(summary));

    return supporting ? `${primarySummary} ${supporting}`.trim() : primarySummary;
  }

  private buildSpecificAnswer(chunks: SearchResult[]): string {
    const primary = chunks[0];

    if (!primary) {
      return '';
    }

    const primarySummary = this.summarizeChunk(primary.content, 2);
    const secondary = chunks[1];

    if (!secondary) {
      return primarySummary;
    }

    const secondarySummary = this.summarizeChunk(secondary.content, 1);

    if (primarySummary.length >= 260 || secondarySummary.length === 0) {
      return primarySummary;
    }

    return `${primarySummary} ${secondarySummary}`.trim();
  }

  private buildComparisonAnswer(chunks: SearchResult[]): string {
    const first = chunks[0];
    const second = chunks[1];

    if (!first) {
      return '';
    }

    if (!second) {
      return this.summarizeChunk(first.content, 2);
    }

    return `${first.metadata.title}: ${this.summarizeChunk(first.content, 1)}\n${second.metadata.title}: ${this.summarizeChunk(second.content, 1)}`;
  }

  private summarizeChunk(content: string, maxSentences: number): string {
    const normalized = content
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const sentences = normalized
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);

    if (sentences.length > 0) {
      return sentences.slice(0, maxSentences).join(' ').trim();
    }

    return normalized;
  }

  private extractStepNumber(title: string): number {
    const match = title.match(/Stap (\d+)/i);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  }
}
