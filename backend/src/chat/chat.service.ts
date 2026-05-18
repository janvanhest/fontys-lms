import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { ConversationEntity } from './conversation.entity';
import { ConversationService } from './conversation.service';
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
    private readonly conversationService: ConversationService,
    private readonly studentContextTool: StudentContextTool,
    private readonly ragTool: RagTool,
    private readonly configService: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
  }

  async *streamResponse(dto: SendMessageDto, studentId: string): AsyncGenerator<ChatSseEvent> {
    const conversation = await this.getOrCreateConversation(dto.conversationId, studentId);
    await this.conversationService.addMessage(conversation.id, 'student', dto.message);

    const messages = this.buildMessageHistory(conversation, dto.message);
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
        await this.conversationService.addMessage(conversation.id, 'assistant', text);
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
    await this.conversationService.addMessage(conversation.id, 'assistant', fallback);
    yield { event: 'final', data: fallback };
  }

  private async getOrCreateConversation(
    conversationId: string | undefined,
    studentId: string,
  ): Promise<ConversationEntity> {
    if (conversationId) {
      const existing = await this.conversationService.findConversationWithMessages(conversationId);
      if (existing) return existing;
    }
    return this.conversationService.createConversation(studentId);
  }

  private buildMessageHistory(
    conversation: ConversationEntity,
    newMessage: string,
  ): Anthropic.MessageParam[] {
    const history: Anthropic.MessageParam[] = (conversation.messages ?? []).map((m) => ({
      role: m.role === 'student' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }));
    history.push({ role: 'user', content: newMessage });
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
        result = `Unknown tool: ${block.name}`;
      }

      events.push({ event: 'tool_result', data: JSON.stringify({ name: block.name }) });
      results.push({ type: 'tool_result', tool_use_id: block.id, content: result });
    }

    return { events, results };
  }
}
