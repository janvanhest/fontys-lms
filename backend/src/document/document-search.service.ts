import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';

export type ChatSource = {
  kind: string;
  label: string;
  url: string | null;
};

export type DocumentSearchResult = {
  content: string;
  sources: ChatSource[];
};

type DocumentRow = {
  content: string;
  source: string;
  title: string;
  url: string | null;
};

export class DocumentSearchUnavailableError extends Error {
  constructor(message = 'Course search unavailable') {
    super(message);
    this.name = 'DocumentSearchUnavailableError';
  }
}

@Injectable()
export class DocumentSearchService {
  private readonly logger = new Logger(DocumentSearchService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async zoekRelevanteChunks(query: string, topK = 5): Promise<DocumentSearchResult> {
    const embedding = await this.embeddingService.embedText(query);
    if (!embedding) {
      this.logger.warn('Vector search unavailable because embedding generation failed');
      throw new DocumentSearchUnavailableError('Course search unavailable');
    }

    const vectorLiteral = `[${embedding.join(',')}]`;
    let rows: DocumentRow[];
    try {
      rows = await this.dataSource.query<DocumentRow[]>(
        `SELECT
           content,
           metadata->>'source' AS source,
           metadata->>'title' AS title,
           metadata->>'url' AS url
         FROM documents
         WHERE embedding IS NOT NULL
         ORDER BY embedding <=> $1::vector
         LIMIT $2`,
        [vectorLiteral, topK],
      );
    } catch (error) {
      this.logger.warn(`Vector search query failed: ${String(error)}`);
      throw new DocumentSearchUnavailableError('Course search unavailable');
    }

    if (rows.length === 0) return { content: '', sources: [] };

    return {
      content: rows.map((r) => r.content).join('\n\n---\n\n'),
      sources: rows.map((row) => ({
        kind: row.source || 'unknown',
        label: this.buildSourceLabel(row.source, row.title),
        url: row.url,
      })),
    };
  }

  private buildSourceLabel(source: string, title: string): string {
    const trimmedTitle = title.trim() || 'Onbekende bron';
    if (source.trim().toLowerCase() === 'canvas') {
      return `Canvas: ${trimmedTitle}`;
    }

    const sourceLabel = source.trim() || 'Bron';
    return `${sourceLabel}: ${trimmedTitle}`;
  }
}
