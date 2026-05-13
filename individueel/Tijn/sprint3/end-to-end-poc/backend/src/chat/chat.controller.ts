import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';
import { ChatService } from './chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post()
  @ApiOperation({
    summary: 'Synchrone chat (voor Swagger / curl). Wacht tot alle tools klaar zijn.',
    description:
      'Claude besluit zelf welke tools hij aanroept: RAG via search_hbo_competentie, of function calling via get_student_*. Het antwoord bevat ook een trace van de tool-calls zodat zichtbaar is dat het hybride werkt.',
  })
  @ApiResponse({ status: 200, type: ChatResponseDto })
  async ask(@Body() body: ChatRequestDto): Promise<ChatResponseDto> {
    return this.chat.handle(body);
  }

  @Post('stream')
  @ApiOperation({
    summary: 'Streaming chat (Server-Sent Events). Frontend ontvangt live updates over thinking, tool_call, tool_result en final.',
  })
  async stream(@Body() body: ChatRequestDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const send = (event: string, data: any) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      await this.chat.handleStreaming(body, send);
    } catch (err: any) {
      send('error', { message: err?.message || String(err) });
    }
    res.end();
  }
}
