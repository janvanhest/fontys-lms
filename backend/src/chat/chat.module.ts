import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingModule } from '../embedding/embedding.module';
import { MessageEntity } from './message.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DocumentSearchService } from './document-search.service';
import { ConversationEntity } from './conversation.entity';
import { ConversationService } from './conversation.service';
import { RagTool } from './rag.tool';
import { StudentContextTool } from './student-context.tool';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity, MessageEntity]),
    EmbeddingModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ConversationService,
    DocumentSearchService,
    StudentContextTool,
    RagTool,
  ],
})
export class ChatModule {}
