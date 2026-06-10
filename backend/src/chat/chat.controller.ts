import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  MessageEvent,
  Param,
  Patch,
  Post,
  Sse,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { CurrentStudent } from '../auth/decorators/current-student.decorator';
import { Student } from '../student/student.entity';
import { ChatService, ChatSseEvent } from './chat.service';
import { ConversationService, type ConversationWithMessagesView } from './conversation.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateConversationTitleDto } from './dto/update-conversation-title.dto';
import { ConversationEntity } from './entities/conversation.entity';

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
  @ApiBody({ type: SendMessageDto })
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
  @ApiOkResponse({ type: [ConversationEntity] })
  async getConversations(@CurrentStudent() student: Student): Promise<ConversationEntity[]> {
    return this.conversationService.findConversationsByStudent(student.id);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Conversation with messages by ID (FR-08)' })
  @ApiOkResponse({ type: ConversationEntity })
  async getConversation(
    @Param('id') id: string,
    @CurrentStudent() student: Student,
  ): Promise<ConversationWithMessagesView | null> {
    return this.conversationService.findConversationWithMessages(id, student.id);
  }

  @Patch('conversations/:id')
  @ApiOperation({ summary: 'Update a conversation title for the logged-in student' })
  @ApiBody({ type: UpdateConversationTitleDto })
  @ApiOkResponse({
    schema: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' } } },
  })
  async updateConversationTitle(
    @Param('id') id: string,
    @Body() dto: UpdateConversationTitleDto,
    @CurrentStudent() student: Student,
  ) {
    await this.conversationService.updateConversationTitle(id, student.id, dto.title);
    return { id, title: dto.title.trim() };
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a conversation for the logged-in student' })
  async deleteConversation(
    @Param('id') id: string,
    @CurrentStudent() student: Student,
  ): Promise<void> {
    await this.conversationService.deleteConversation(id, student.id);
  }
}
