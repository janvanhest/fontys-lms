import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingModule } from '../embedding/embedding.module';
import { DocumentModule } from '../document/document.module';
import { CompetenceModule } from '../competence/competence.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConversationEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';
import { ConversationService } from './conversation.service';
import { GetCompetenceFrameworkTool } from './tools/get-competence-framework.tool';
import { GetStudentCompetencesTool } from './tools/get-student-competences.tool';
import { RagTool } from './tools/rag.tool';
import { StudentContextTool } from './tools/student-context.tool';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity, MessageEntity]),
    EmbeddingModule,
    DocumentModule,
    CompetenceModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ConversationService,
    StudentContextTool,
    RagTool,
    GetStudentCompetencesTool,
    GetCompetenceFrameworkTool,
  ],
})
export class ChatModule {}
