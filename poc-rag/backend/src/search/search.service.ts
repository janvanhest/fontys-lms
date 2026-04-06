import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DocumentEntity } from '../database/document.entity';
import { EmbeddingService } from '../embedding/embedding.service';

export interface SearchResult {
  id: string;
  content: string;
  metadata: DocumentEntity['metadata'];
  score: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async searchRelevantChunks(message: string, limit = 3): Promise<SearchResult[]> {
    const embeddedQuery = await this.embeddingService.embedText(message);

    if (embeddedQuery) {
      const vectorResults = await this.searchByVector(embeddedQuery, limit);

      if (vectorResults.length > 0) {
        return vectorResults;
      }
    }

    return this.searchByKeywords(message, limit);
  }

  private async searchByVector(embedding: number[], limit: number): Promise<SearchResult[]> {
    const embeddingLiteral = `[${embedding.join(',')}]`;

    const rows = await this.documentRepository.query(
      `
        SELECT
          id,
          content,
          metadata,
          1 - (embedding <=> $1::vector) AS score
        FROM documents
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> $1::vector
        LIMIT $2
      `,
      [embeddingLiteral, limit],
    );

    return rows.map((row: SearchResult) => ({
      id: row.id,
      content: row.content,
      metadata: row.metadata,
      score: Number(row.score),
    }));
  }

  private async searchByKeywords(message: string, limit: number): Promise<SearchResult[]> {
    const terms = this.tokenize(message);
    const documents = await this.documentRepository.find();

    return documents
      .map((document) => ({
        id: document.id,
        content: document.content,
        metadata: document.metadata,
        score: this.keywordScore(document.content, terms),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private tokenize(input: string): string[] {
    return input
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter((part) => part.length > 2);
  }

  private keywordScore(content: string, terms: string[]): number {
    const haystack = content.toLowerCase();

    return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
  }
}

