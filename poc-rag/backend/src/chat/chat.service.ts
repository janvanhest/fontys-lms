import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

import { SearchResult, SearchService } from '../search/search.service';
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

  async answer(body: ChatMessageDto): Promise<{ answer: string }> {
    const history = body.history ?? [];
    const chunks = await this.searchService.searchRelevantChunks(body.message, 3);

    if (chunks.length === 0) {
      return { answer: this.noContextAnswer };
    }

    if (!this.anthropicKey) {
      this.logger.log('ANTHROPIC_API_KEY ontbreekt, lokale fallback-response wordt gebruikt.');
      return { answer: this.buildFallbackAnswer(chunks) };
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
        return { answer: text };
      }

      this.logger.warn('Anthropic gaf een leeg antwoord terug, lokale fallback-response wordt gebruikt.');
    } catch (error) {
      this.logger.warn(
        `Anthropic request mislukt, lokale fallback-response wordt gebruikt: ${
          error instanceof Error ? error.message : 'onbekende fout'
        }`,
      );
    }

    return { answer: this.buildFallbackAnswer(chunks) };
  }

  private toAnthropicMessages(history: HistoryItemDto[]): Anthropic.MessageParam[] {
    return history.map((item) => ({
      role: item.role,
      content: item.content,
    }));
  }

  private buildFallbackAnswer(chunks: SearchResult[]): string {
    const snippets = chunks
      .slice(0, 3)
      .map((chunk) => this.normalizeSnippet(chunk.content))
      .filter((snippet, index, all) => snippet.length > 0 && all.indexOf(snippet) === index);

    if (snippets.length === 0) {
      return this.noContextAnswer;
    }

    if (snippets.length === 1) {
      return snippets[0];
    }

    return `Op basis van de cursusinhoud lijkt het antwoord hierop neer te komen:\n\n${snippets.join('\n\n')}`;
  }

  private normalizeSnippet(content: string): string {
    return content.replace(/\s+/g, ' ').trim();
  }
}
