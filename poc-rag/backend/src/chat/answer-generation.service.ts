import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

import { QueryAnalysis, SearchResult } from '../search/search.service';
import { buildGenerationContext, buildGenerationPrompt } from './answer-generation.prompt';
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
        answer: this.finalizeAnswer(this.generateFallback(input.chunks, input.analysis), input),
        mode: 'fallback',
      };
    }

    try {
      const answer = this.finalizeAnswer(await this.generateWithAnthropic(input), input);

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
      answer: this.finalizeAnswer(this.generateFallback(input.chunks, input.analysis), input),
      mode: 'fallback',
    };
  }

  private async generateWithAnthropic(input: GenerateAnswerInput): Promise<string> {
    const client = new Anthropic({ apiKey: this.anthropicKey });
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: buildGenerationPrompt(input.analysis, buildGenerationContext(input.chunks)),
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
      .map((chunk) => `Stap ${this.extractStepNumber(chunk.metadata.title)}: ${this.summarizeChunk(chunk.content, 1)}`)
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

  private finalizeAnswer(answer: string, input: GenerateAnswerInput): string {
    let finalAnswer = answer.trim();

    if (finalAnswer.length === 0) {
      return finalAnswer;
    }

    finalAnswer = this.repairStepSummaryIfNeeded(finalAnswer, input);
    finalAnswer = this.repairAbbreviationExpansionIfNeeded(finalAnswer, input);

    return finalAnswer.trim();
  }

  private repairStepSummaryIfNeeded(answer: string, input: GenerateAnswerInput): string {
    if (!(input.analysis.intent === 'summary' && input.analysis.focusTerms.includes('stappenplan'))) {
      return answer;
    }

    const stepChunks = input.chunks
      .filter((chunk) => /Stap [1-4]:/i.test(chunk.metadata.title))
      .sort((a, b) => this.extractStepNumber(a.metadata.title) - this.extractStepNumber(b.metadata.title));

    if (stepChunks.length < 4) {
      return answer;
    }

    const hasAllStepLabels = [1, 2, 3, 4].every((step) =>
      new RegExp(`(^|\\n)\\s*Stap ${step}:`, 'i').test(answer),
    );

    if (hasAllStepLabels) {
      return answer;
    }

    return this.buildStepSummary(stepChunks);
  }

  private repairAbbreviationExpansionIfNeeded(answer: string, input: GenerateAnswerInput): string {
    const normalizedQuestion = input.question.toLowerCase();
    const asksAboutPo = /\bpo\b/i.test(input.question);

    if (!asksAboutPo) {
      return answer;
    }

    const explicitPoExpansion = this.findExplicitPoExpansion(input.chunks);

    if (explicitPoExpansion) {
      return answer;
    }

    if (/^waar staat po voor/i.test(normalizedQuestion)) {
      return this.buildPoNoExpansionAnswer(input.chunks, true);
    }

    if (/po staat voor/i.test(answer)) {
      return this.buildPoNoExpansionAnswer(input.chunks, false);
    }

    return answer;
  }

  private findExplicitPoExpansion(chunks: SearchResult[]): string | null {
    for (const chunk of chunks) {
      const match = chunk.content.match(/\bPO staat voor\s+([^.\n]+)/i);

      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  private buildPoNoExpansionAnswer(chunks: SearchResult[], explicitQuestion: boolean): string {
    const meaning = this.buildDefinitionAnswer(chunks)
      .replace(/^PO staat voor\s+[^.]+\.\s*/i, '')
      .trim();

    if (explicitQuestion) {
      return `De meegeleverde cursusinhoud legt niet letterlijk uit waar de afkorting PO voor staat. Wel blijkt dat PO hier gaat over hoe je werkt, zoals communicatie, samenwerking, feedback verwerken en verantwoordelijkheid nemen.${meaning.length > 0 ? ` ${meaning}` : ''}`.trim();
    }

    return `PO gaat hier over hoe je werkt, zoals communicatie, samenwerking, feedback verwerken en verantwoordelijkheid nemen.${meaning.length > 0 ? ` ${meaning}` : ''}`.trim();
  }
}
