import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ToolsService } from '../tools/tools.service';
import { TOOL_DEFINITIONS } from '../tools/tool-definitions';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto, ToolCallTraceDto } from './dto/chat-response.dto';
import { buildSystemPrompt } from './prompts';

const MAX_TOOL_ITERATIONS = 6;

export type ChatEvent = (event: string, data: any) => void;
const NOOP: ChatEvent = () => {};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  constructor(private readonly tools: ToolsService) {}

  handle(req: ChatRequestDto): Promise<ChatResponseDto> {
    return this.run(req, NOOP);
  }

  handleStreaming(req: ChatRequestDto, emit: ChatEvent): Promise<ChatResponseDto> {
    return this.run(req, emit);
  }

  private async run(req: ChatRequestDto, emit: ChatEvent): Promise<ChatResponseDto> {
    const studentId = req.student_id ?? 1;
    const history = (req.history || []).map((m) => ({ role: m.role, content: m.content }));
    const messages: Anthropic.MessageParam[] = [
      ...history,
      { role: 'user', content: req.message },
    ];

    const traces: ToolCallTraceDto[] = [];

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      emit('status', { phase: i === 0 ? 'thinking' : 'writing' });

      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: buildSystemPrompt(studentId),
        tools: TOOL_DEFINITIONS,
        messages,
      });

      if (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
        );

        messages.push({ role: 'assistant', content: response.content });

        const toolResultBlocks: Anthropic.ToolResultBlockParam[] = [];
        for (const block of toolUseBlocks) {
          emit('tool_call', { name: block.name, input: block.input });
          const result = await this.tools.execute(block.name, block.input);
          const count = Array.isArray(result) ? result.length : result && typeof result === 'object' ? 1 : 0;
          emit('tool_result', { name: block.name, count });

          traces.push({ name: block.name, input: block.input, result });
          toolResultBlocks.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }

        messages.push({ role: 'user', content: toolResultBlocks });
        continue;
      }

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n');

      const final = { answer: text, tool_calls: traces };
      emit('final', final);
      return final;
    }

    const fallback = {
      answer: 'Te veel tool-iteraties zonder eindantwoord. Probeer je vraag te versimpelen.',
      tool_calls: traces,
    };
    emit('final', fallback);
    return fallback;
  }

}
