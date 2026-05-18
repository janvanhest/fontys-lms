import { Body, Controller, Get, MessageEvent, Param, Post, Sse } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { CurrentStudent } from '../auth/decorators/current-student.decorator';
import { Student } from '../student/student.entity';
import { ChatService, ChatSseEvent } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GesprekService } from './gesprek.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly gesprekService: GesprekService,
  ) {}

  @Post('stream')
  @Sse()
  @ApiOperation({ summary: 'Start een SSE-stream voor een chatbericht (FR-13)' })
  stream(
    @Body() dto: SendMessageDto,
    @CurrentStudent() student: Student,
  ): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      void (async () => {
        try {
          for await (const event of this.chatService.streamAntwoord(dto, student.id)) {
            subscriber.next({ data: JSON.stringify(event) } as MessageEvent);
          }
          subscriber.complete();
        } catch (error: unknown) {
          const errEvent: ChatSseEvent = {
            event: 'error',
            data: error instanceof Error ? error.message : String(error),
          };
          subscriber.next({ data: JSON.stringify(errEvent) } as MessageEvent);
          subscriber.complete();
        }
      })();
    });
  }

  @Get('gesprekken')
  @ApiOperation({ summary: 'Gesprekslijst van de ingelogde student (FR-08)' })
  async getGesprekken(@CurrentStudent() student: Student) {
    return this.gesprekService.vindGesprekkenVanStudent(student.id);
  }

  @Get('gesprekken/:id')
  @ApiOperation({ summary: 'Gesprek met berichten op ID (FR-08)' })
  async getGesprek(@Param('id') id: string) {
    return this.gesprekService.vindGesprekMetBerichten(id);
  }
}
