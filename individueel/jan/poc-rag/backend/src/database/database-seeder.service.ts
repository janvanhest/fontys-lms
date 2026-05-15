import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmbeddingService } from '../embedding/embedding.service';
import { seedChunks } from './course-content';
import { DocumentEntity } from './document.entity';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const existingCount = await this.documentRepository.count();

    if (existingCount > 0) {
      this.logger.log('Documents tabel bevat al data, seed wordt overgeslagen.');
      return;
    }

    const entities: DocumentEntity[] = [];

    for (const [index, chunk] of seedChunks.entries()) {
      const embedding = await this.embeddingService.embedText(chunk.content);

      entities.push(
        this.documentRepository.create({
          content: chunk.content,
          embedding,
          metadata: {
            source: chunk.source,
            title: chunk.title,
            chunkIndex: index,
          },
        }),
      );
    }

    await this.documentRepository.save(entities);
    this.logger.log(`Seed afgerond met ${entities.length} chunks.`);
  }
}

