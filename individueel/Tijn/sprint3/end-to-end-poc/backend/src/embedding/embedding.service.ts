import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly url = process.env.OLLAMA_URL || 'http://host.docker.internal:11434';
  private readonly model = 'nomic-embed-text';

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.url}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt: text }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ollama embedding mislukt (${response.status}): ${body}`);
    }

    const data = (await response.json()) as { embedding: number[] };
    if (!Array.isArray(data.embedding)) {
      throw new Error(`Ollama gaf geen embedding terug: ${JSON.stringify(data)}`);
    }
    return data.embedding;
  }
}
