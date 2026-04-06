import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

import { SearchService } from '../search/search.service';
import { ChatMessageDto, HistoryItemDto } from './dto/chat-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly anthropicKey: string;

  constructor(
    private readonly searchService: SearchService,
    private readonly configService: ConfigService,
  ) {
    this.anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY', '');
  }

  async answer(body: ChatMessageDto): Promise<{ answer: string }> {
    const history = body.history ?? [];
    const chunks = await this.searchService.searchRelevantChunks(body.message, 3);
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

    return { answer: text };
  }

  private toAnthropicMessages(history: HistoryItemDto[]): Anthropic.MessageParam[] {
    return history.map((item) => ({
      role: item.role,
      content: item.content,
    }));
  }
}
