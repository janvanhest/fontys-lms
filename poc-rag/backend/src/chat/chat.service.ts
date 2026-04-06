import { Injectable, Logger } from '@nestjs/common';

import { SearchResult, SearchService } from '../search/search.service';
import { AnswerGenerationService } from './answer-generation.service';
import { ChatResponseDto, ChatSourceDto } from './chat-response.dto';
import { ChatMessageDto } from './dto/chat-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly noContextAnswer =
    'Ik kon geen passend antwoord vinden in de meegeleverde cursusinhoud. Stel je vraag specifieker over het stappenplan, het semesterplan of hoe Pro Open Learning werkt.';

  constructor(
    private readonly searchService: SearchService,
    private readonly answerGenerationService: AnswerGenerationService,
  ) {}

  async answer(body: ChatMessageDto): Promise<ChatResponseDto> {
    const history = body.history ?? [];
    const outcome = await this.searchService.searchRelevantChunks(body.message, 3);
    const { analysis, results: chunks } = outcome;
    const sources = this.buildSources(chunks);

    if (chunks.length === 0) {
      this.logger.log(`chat mode=no-context intent=${analysis.intent} question="${body.message}"`);
      return { answer: this.noContextAnswer, sources: [] };
    }

    const generation = await this.answerGenerationService.generate({
      question: body.message,
      history,
      analysis,
      chunks,
    });

    this.logger.log(
      `chat mode=${generation.mode} intent=${analysis.intent} question="${body.message}" sources=${this.formatSourcesForLog(sources)}`,
    );

    return { answer: generation.answer, sources };
  }

  private buildSources(chunks: SearchResult[]): ChatSourceDto[] {
    const seen = new Set<string>();

    return chunks
      .slice(0, 3)
      .map((chunk) => ({
        title: chunk.metadata.title,
        source: chunk.metadata.source,
        score: Number(chunk.score.toFixed(3)),
      }))
      .filter((chunk) => {
        const key = `${chunk.source}::${chunk.title}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      });
  }

  private formatSourcesForLog(sources: ChatSourceDto[]): string {
    return sources.map((source) => `${source.title} (${source.score})`).join(', ');
  }
}
