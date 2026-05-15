import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentEntity } from '../database/document.entity';
import { EmbeddingModule } from '../embedding/embedding.module';
import { SearchService } from './search.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity]), EmbeddingModule],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}

