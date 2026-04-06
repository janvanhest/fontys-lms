import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SearchModule } from '../search/search.module';
import { AnswerGenerationService } from './answer-generation.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [ConfigModule, SearchModule],
  controllers: [ChatController],
  providers: [ChatService, AnswerGenerationService],
})
export class ChatModule {}
