import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { ConversationEntity } from './entities/conversation.entity';
import { ConversationService } from './conversation.service';
import { RAG_TOOL_DEF, RagTool } from './tools/rag.tool';
import { STUDENT_CONTEXT_TOOL_DEF, StudentContextTool } from './tools/student-context.tool';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatSource } from '../document/document-search.service';

export type ChatSseEvent = { event: string; data: string };
type FinalChatPayload = { text: string; conversationId: string; sources?: ChatSource[] };

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
  private readonly logger = new Logger(ChatService.name);
  private readonly studentContextEnabled = false;

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
    const usedSources: ChatSource[] = [];
    let iterations = 0;
    let lastStopReason: string | null = null;

    while (iterations < 6) {
      yield { event: 'status', data: iterations === 0 ? 'Nadenken...' : 'Tool uitvoeren...' };

      const response = await this.anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        system: this.buildSystemPrompt(),
        messages,
        tools: this.getAvailableTools(),
      });
      lastStopReason = response.stop_reason;

      messages.push({ role: 'assistant', content: response.content });

      if (response.stop_reason === 'end_turn') {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('');
        await this.conversationService.addMessage(conversation.id, 'assistant', text);
        await this.maybeUpdateConversationTitle(conversation, dto.message);
        yield { event: 'final', data: this.serializeFinalPayload(conversation.id, text, usedSources) };
        return;
      }

      if (response.stop_reason === 'tool_use') {
        const toolResults = await this.executeToolCalls(response.content, studentId);
        for (const event of toolResults.events) {
          yield event;
        }
        usedSources.push(...toolResults.sources);
        messages.push({ role: 'user', content: toolResults.results });
      }

      iterations++;
    }

    this.logger.warn(
      `tool loop iteration cap reached for conversationId=${conversation.id} stopReason=${lastStopReason ?? 'unknown'}`,
    );
    const fallback =
      'Ik kon je vraag niet volledig beantwoorden binnen het maximale aantal stappen.';
    await this.conversationService.addMessage(conversation.id, 'assistant', fallback);
    yield {
      event: 'final',
      data: this.serializeFinalPayload(conversation.id, fallback, usedSources),
    };
  }

  private buildSystemPrompt(): string {
    if (this.studentContextEnabled) return SYSTEM_PROMPT;

    return `${SYSTEM_PROMPT}

Let op: student-specifieke challenge- en activiteitsdata zijn tijdelijk nog niet beschikbaar. Baseer je dus niet op get_student_context tenzij dit later expliciet wordt aangezet.`;
  }

  private getAvailableTools() {
    return this.studentContextEnabled
      ? [STUDENT_CONTEXT_TOOL_DEF, RAG_TOOL_DEF]
      : [RAG_TOOL_DEF];
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
    sources: ChatSource[];
  }> {
    const events: ChatSseEvent[] = [];
    const results: Anthropic.ToolResultBlockParam[] = [];
    const sources: ChatSource[] = [];

    for (const block of content) {
      if (block.type !== 'tool_use') continue;

      events.push({ event: 'tool_call', data: JSON.stringify({ name: block.name }) });

      let result: string;
      if (block.name === 'get_student_context') {
        if (!this.studentContextEnabled) {
          this.logger.warn(`student context tool called while disabled for studentId=${studentId}`);
          result = JSON.stringify({
            available: false,
            temporary: true,
            notitie: 'Studentcontext is tijdelijk uitgeschakeld totdat echte studentdata beschikbaar is.',
          });
        } else {
          result = await this.studentContextTool.execute(studentId);
        }
      } else if (block.name === 'search_course_content') {
        const retrieval = await this.ragTool.execute((block.input as { query: string }).query);
        result = retrieval.content;
        sources.push(...retrieval.sources);
      } else {
        result = `Unknown tool: ${block.name}`;
      }

      events.push({ event: 'tool_result', data: JSON.stringify({ name: block.name }) });
      results.push({ type: 'tool_result', tool_use_id: block.id, content: result });
    }

    return { events, results, sources };
  }

  private serializeFinalPayload(
    conversationId: string,
    text: string,
    sources: ChatSource[],
  ): string {
    const payload: FinalChatPayload = { text, conversationId };
    const uniqueSources = this.deduplicateSources(sources).slice(0, 3);
    if (uniqueSources.length > 0) {
      payload.sources = uniqueSources;
    }
    return JSON.stringify(payload);
  }

  private deduplicateSources(sources: ChatSource[]): ChatSource[] {
    const seen = new Set<string>();
    const unique: ChatSource[] = [];

    for (const source of sources) {
      const key = `${source.label}::${source.url ?? ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(source);
    }

    return unique;
  }

  private async maybeUpdateConversationTitle(
    conversation: ConversationEntity,
    latestStudentMessage: string,
  ): Promise<void> {
    if (conversation.titleManuallyEdited) return;

    const nextRevision = this.getNextTitleRevision(conversation, latestStudentMessage);
    if (nextRevision === null) return;

    const title = this.generateConversationTitle(latestStudentMessage);
    if (!title) return;

    await this.conversationService.updateAutoConversationTitle(
      conversation.id,
      title,
      nextRevision,
    );
  }

  private getNextTitleRevision(
    conversation: ConversationEntity,
    latestStudentMessage: string,
  ): number | null {
    const revisionCount = conversation.titleRevisionCount ?? 0;
    if (revisionCount === 0) {
      return 1;
    }

    if (revisionCount >= 2) {
      return null;
    }

    const studentMessages = [
      ...(conversation.messages ?? []).filter((message) => message.role === 'student'),
      { role: 'student', content: latestStudentMessage },
    ];

    return studentMessages.length >= 2 ? 2 : null;
  }

  private generateConversationTitle(message: string): string | null {
    const cleaned = message
      .replace(/[?!.,:;()[\]"]/g, ' ')
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    const stopwords = new Set([
      'aan',
      'als',
      'bij',
      'de',
      'dit',
      'doen',
      'een',
      'en',
      'er',
      'gaan',
      'hebben',
      'helpen',
      'het',
      'hoe',
      'hun',
      'ik',
      'in',
      'je',
      'kan',
      'kun',
      'kunnen',
      'met',
      'mijn',
      'moet',
      'ook',
      'past',
      'van',
      'voor',
      'wat',
      'wil',
      'weten',
    ]);

    const significantWords = cleaned.filter((word) => !stopwords.has(word.toLowerCase()));
    const selectedWords = (significantWords.length > 0 ? significantWords : cleaned).slice(0, 4);
    if (selectedWords.length === 0) return null;

    return selectedWords
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
