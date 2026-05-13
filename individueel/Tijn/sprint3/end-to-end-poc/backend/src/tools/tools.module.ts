import { Module } from '@nestjs/common';
import { EmbeddingModule } from '../embedding/embedding.module';
import { ToolsService } from './tools.service';

@Module({
  imports: [EmbeddingModule],
  providers: [ToolsService],
  exports: [ToolsService],
})
export class ToolsModule {}
