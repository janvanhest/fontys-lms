import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingModule } from '../embedding/embedding.module';
import { DocumentEntity } from './document.entity';
import { DocumentSearchService } from './document-search.service';
import { DocumentSeederService } from './document-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity]), EmbeddingModule],
  providers: [DocumentSeederService, DocumentSearchService],
  exports: [DocumentSeederService, DocumentSearchService],
})
export class DocumentModule {}
