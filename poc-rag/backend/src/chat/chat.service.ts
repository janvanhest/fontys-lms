import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

import { SearchResult, SearchService } from '../search/search.service';
import { ChatResponseDto, ChatSourceDto } from './chat-response.dto';
import { ChatMessageDto, HistoryItemDto } from './dto/chat-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly anthropicKey: string;
  private readonly noContextAnswer =
    'Ik kon geen passend antwoord vinden in de meegeleverde cursusinhoud. Stel je vraag specifieker over het stappenplan, het semesterplan of Pro Open Learning.';

  constructor(
    private readonly searchService: SearchService,
    private readonly configService: ConfigService,
  ) {
    this.anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY', '');
  }

  async answer(body: ChatMessageDto): Promise<ChatResponseDto> {
    const history = body.history ?? [];
    const chunks = await this.searchService.searchRelevantChunks(body.message, 3);
    const sources = this.buildSources(chunks);

    if (chunks.length === 0) {
      this.logger.log(`chat mode=no-context question="${body.message}"`);
      return { answer: this.noContextAnswer, sources: [] };
    }

    if (!this.anthropicKey) {
      this.logger.log(`chat mode=fallback question="${body.message}" sources=${this.formatSourcesForLog(sources)}`);
      return { answer: this.buildFallbackAnswer(chunks), sources };
    }

    try {
      const context = chunks.map((c) => c.content).join('\n\n---\n\n');
      const client = new Anthropic({ apiKey: this.anthropicKey });
      const response = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: `Je bent een behulpzame studieassistent voor Fontys Pro Open Learning.
Beantwoord vragen uitsluitend op basis van de aangeleverde cursusinhoud.
Als het antwoord niet in de context staat, zeg dat dan eerlijk.
Antwoord altijd in het Nederlands.

Cursusinhoud:
${context}`,
        messages: [
          ...this.toAnthropicMessages(history),
          { role: 'user', content: body.message },
        ],
      });

      const text = response.content
        .filter((item): item is Anthropic.TextBlock => item.type === 'text')
        .map((item) => item.text)
        .join('\n')
        .trim();

      if (text.length > 0) {
        this.logger.log(`chat mode=anthropic question="${body.message}" sources=${this.formatSourcesForLog(sources)}`);
        return { answer: text, sources };
      }

      this.logger.warn('Anthropic gaf een leeg antwoord terug, lokale fallback-response wordt gebruikt.');
    } catch (error) {
      this.logger.warn(
        `Anthropic request mislukt, lokale fallback-response wordt gebruikt: ${
          error instanceof Error ? error.message : 'onbekende fout'
        }`,
      );
    }

    this.logger.log(`chat mode=fallback question="${body.message}" sources=${this.formatSourcesForLog(sources)}`);
    return { answer: this.buildFallbackAnswer(chunks), sources };
  }

  private toAnthropicMessages(history: HistoryItemDto[]): Anthropic.MessageParam[] {
    return history.map((item) => ({
      role: item.role,
      content: item.content,
    }));
  }

  private buildFallbackAnswer(chunks: SearchResult[]): string {
    const primary = chunks[0];

    if (!primary) {
      return this.noContextAnswer;
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

  private buildSources(chunks: SearchResult[]): ChatSourceDto[] {
    const seen = new Set<string>();

    return chunks
      .slice(0, 3)
      .map((chunk) => ({
        title: chunk.metadata.title,
        source: chunk.metadata.source,
        score: Number(chunk.score.toFixed(3)),
      }))
      .filter((chunk) => {
        const key = `${chunk.source}::${chunk.title}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });
  }

  private formatSourcesForLog(sources: ChatSourceDto[]): string {
    return sources.map((source) => `${source.title} (${source.score})`).join(', ');
  }

  private summarizeChunk(content: string, maxSentences: number): string {
    const normalized = content
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const sentences = normalized
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0 && !sentence.startsWith('- '));

    if (sentences.length > 0) {
      return sentences.slice(0, maxSentences).join(' ').trim();
    }

    return normalized;
  }
}
