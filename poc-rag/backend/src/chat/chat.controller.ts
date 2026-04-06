import { Body, Controller, Post } from '@nestjs/common';

import { ChatMessageDto } from './dto/chat-message.dto';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: ChatMessageDto): Promise<{ answer: string }> {
    return this.chatService.answer(body);
  }
}
