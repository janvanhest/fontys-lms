import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingModule } from '../embedding/embedding.module';
import { DocumentModule } from '../document/document.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConversationEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';
import { ConversationService } from './conversation.service';
import { RagTool } from './tools/rag.tool';
import { StudentContextTool } from './tools/student-context.tool';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity, MessageEntity]),
    EmbeddingModule,
    DocumentModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ConversationService, StudentContextTool, RagTool],
})
export class ChatModule {}
