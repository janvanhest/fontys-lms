import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly ollamaUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.ollamaUrl = this.configService.getOrThrow<string>('OLLAMA_URL');
  }

  async embedText(text: string): Promise<number[] | null> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'nomic-embed-text', prompt: text }),
      });

      if (!response.ok) {
        this.logger.warn(`Ollama returned non-200 status: ${response.status}`);
        return null;
      }

      const data = (await response.json()) as { embedding: number[] };
      return data.embedding;
    } catch (error) {
      this.logger.warn(`Failed to reach Ollama: ${String(error)}`);
      return null;
    }
  }
}
