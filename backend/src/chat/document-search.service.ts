import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';

type DocumentRow = { content: string };

@Injectable()
export class DocumentSearchService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async zoekRelevanteChunks(query: string, topK = 5): Promise<string> {
    const embedding = await this.embeddingService.embedText(query);
    if (!embedding) return '';

    const vectorLiteral = `[${embedding.join(',')}]`;
    const rows = await this.dataSource.query<DocumentRow[]>(
      `SELECT content
       FROM documents
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [vectorLiteral, topK],
    );

    if (rows.length === 0) return '';
    return rows.map((r) => r.content).join('\n\n---\n\n');
  }
}
