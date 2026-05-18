import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingModule } from '../embedding/embedding.module';
import { BerichtEntity } from './bericht.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DocumentSearchService } from './document-search.service';
import { GesprekEntity } from './gesprek.entity';
import { GesprekService } from './gesprek.service';
import { RagTool } from './rag.tool';
import { StudentContextTool } from './student-context.tool';

@Module({
  imports: [
    TypeOrmModule.forFeature([GesprekEntity, BerichtEntity]),
    EmbeddingModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    GesprekService,
    DocumentSearchService,
    StudentContextTool,
    RagTool,
  ],
})
export class ChatModule {}
