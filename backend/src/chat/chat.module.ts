import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityModule } from '../activity/activity.module';
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
import { PerformUiActionTool } from './tools/perform-ui-action.tool';
import { RagTool } from './tools/rag.tool';
import { SearchActivitiesTool } from './tools/search-activities.tool';
import { StudentContextTool } from './tools/student-context.tool';
import { TitleGenerationService } from './title-generation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity, MessageEntity]),
    ActivityModule,
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
    SearchActivitiesTool,
    PerformUiActionTool,
    TitleGenerationService,
  ],
})
export class ChatModule {}
