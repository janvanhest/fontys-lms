import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingModule } from '../embedding/embedding.module';
import { DocumentEntity } from './document.entity';
import { DocumentSeederService } from './document-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity]), EmbeddingModule],
  providers: [DocumentSeederService],
  exports: [DocumentSeederService],
})
export class DocumentModule {}
