import { Body, Controller, Get, MessageEvent, Param, Patch, Post, Sse } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { CurrentStudent } from '../auth/decorators/current-student.decorator';
import { Student } from '../student/student.entity';
import { ChatService, ChatSseEvent } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationService } from './conversation.service';
import { UpdateConversationTitleDto } from './dto/update-conversation-title.dto';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly conversationService: ConversationService,
  ) {}

  @Post('stream')
  @Sse()
  @ApiOperation({ summary: 'Start SSE stream for a chat message (FR-13)' })
  stream(
    @Body() dto: SendMessageDto,
    @CurrentStudent() student: Student,
  ): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      void (async () => {
        try {
          for await (const event of this.chatService.streamResponse(dto, student.id)) {
            subscriber.next({ type: event.event, data: event.data });
          }
          subscriber.complete();
        } catch (error: unknown) {
          const errEvent: ChatSseEvent = {
            event: 'error',
            data: error instanceof Error ? error.message : String(error),
          };
          subscriber.next({ type: errEvent.event, data: errEvent.data });
          subscriber.complete();
        }
      })();
    });
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Conversation list for the logged-in student (FR-08)' })
  async getConversations(@CurrentStudent() student: Student) {
    return this.conversationService.findConversationsByStudent(student.id);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Conversation with messages by ID (FR-08)' })
  async getConversation(@Param('id') id: string) {
    return this.conversationService.findConversationWithMessages(id);
  }

  @Patch('conversations/:id')
  @ApiOperation({ summary: 'Update a conversation title for the logged-in student' })
  async updateConversationTitle(
    @Param('id') id: string,
    @Body() dto: UpdateConversationTitleDto,
    @CurrentStudent() student: Student,
  ) {
    await this.conversationService.updateConversationTitle(id, student.id, dto.title);
    return { id, title: dto.title.trim() };
  }
}
