import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { GesprekEntity } from './gesprek.entity';
import { GesprekService } from './gesprek.service';
import { RAG_TOOL_DEF, RagTool } from './rag.tool';
import { STUDENT_CONTEXT_TOOL_DEF, StudentContextTool } from './student-context.tool';
import { SendMessageDto } from './dto/send-message.dto';

export type ChatSseEvent = { event: string; data: string };

const SYSTEM_PROMPT = `Je bent een leercoach-assistent voor het Activity First LMS van Fontys HBO-ICT.
Je helpt studenten hun leervoortgang te begrijpen en te verbeteren.

Aanpak:
1. Gebruik search_course_content voor vragen over begrippen, het HBO-i raamwerk of cursusinhoud.
2. Gebruik get_student_context voor vragen over de voortgang, challenge of activiteiten van de student.
3. Combineer beide bronnen voor een volledig antwoord.
Antwoord altijd in het Nederlands. Wees concreet en motiverend.`;

@Injectable()
export class ChatService {
  private readonly anthropic: Anthropic;

  constructor(
    private readonly gesprekService: GesprekService,
    private readonly studentContextTool: StudentContextTool,
    private readonly ragTool: RagTool,
    private readonly configService: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
  }

  async *streamAntwoord(dto: SendMessageDto, studentId: string): AsyncGenerator<ChatSseEvent> {
    const gesprek = await this.getOrCreateGesprek(dto.gesprekId, studentId);
    await this.gesprekService.voegBerichtToe(gesprek.id, 'student', dto.vraag);

    const messages = this.buildMessageHistory(gesprek, dto.vraag);
    let iterations = 0;

    while (iterations < 6) {
      yield { event: 'status', data: iterations === 0 ? 'Nadenken...' : 'Tool uitvoeren...' };

      const response = await this.anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages,
        tools: [STUDENT_CONTEXT_TOOL_DEF, RAG_TOOL_DEF],
      });

      messages.push({ role: 'assistant', content: response.content });

      if (response.stop_reason === 'end_turn') {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('');
        await this.gesprekService.voegBerichtToe(gesprek.id, 'assistent', text);
        yield { event: 'final', data: text };
        return;
      }

      if (response.stop_reason === 'tool_use') {
        const toolResults = await this.executeToolCalls(response.content, studentId);
        for (const event of toolResults.events) {
          yield event;
        }
        messages.push({ role: 'user', content: toolResults.results });
      }

      iterations++;
    }

    const fallback =
      'Ik kon je vraag niet volledig beantwoorden binnen het maximale aantal stappen.';
    await this.gesprekService.voegBerichtToe(gesprek.id, 'assistent', fallback);
    yield { event: 'final', data: fallback };
  }

  private async getOrCreateGesprek(
    gesprekId: string | undefined,
    studentId: string,
  ): Promise<GesprekEntity> {
    if (gesprekId) {
      const existing = await this.gesprekService.vindGesprekMetBerichten(gesprekId);
      if (existing) return existing;
    }
    return this.gesprekService.maakNieuwGesprek(studentId);
  }

  private buildMessageHistory(
    gesprek: GesprekEntity,
    nieuweVraag: string,
  ): Anthropic.MessageParam[] {
    const history: Anthropic.MessageParam[] = (gesprek.berichten ?? []).map((b) => ({
      role: b.rol === 'student' ? ('user' as const) : ('assistant' as const),
      content: b.inhoud,
    }));
    history.push({ role: 'user', content: nieuweVraag });
    return history;
  }

  private async executeToolCalls(
    content: Anthropic.ContentBlock[],
    studentId: string,
  ): Promise<{
    events: ChatSseEvent[];
    results: Anthropic.ToolResultBlockParam[];
  }> {
    const events: ChatSseEvent[] = [];
    const results: Anthropic.ToolResultBlockParam[] = [];

    for (const block of content) {
      if (block.type !== 'tool_use') continue;

      events.push({ event: 'tool_call', data: JSON.stringify({ name: block.name }) });

      let result: string;
      if (block.name === 'get_student_context') {
        result = await this.studentContextTool.execute(studentId);
      } else if (block.name === 'search_course_content') {
        result = await this.ragTool.execute((block.input as { query: string }).query);
      } else {
        result = `Onbekende tool: ${block.name}`;
      }

      events.push({ event: 'tool_result', data: JSON.stringify({ name: block.name }) });
      results.push({ type: 'tool_result', tool_use_id: block.id, content: result });
    }

    return { events, results };
  }
}
