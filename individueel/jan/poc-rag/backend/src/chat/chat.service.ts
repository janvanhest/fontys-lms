import { Injectable, Logger } from '@nestjs/common';

import { QueryAnalysis, SearchResult, SearchService } from '../search/search.service';
import { AnswerGenerationService } from './answer-generation.service';
import { ConversationContextService } from './conversation-context.service';
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
    private readonly conversationContextService: ConversationContextService,
  ) {}

  async answer(body: ChatMessageDto): Promise<ChatResponseDto> {
    const history = body.history ?? [];
    const conversationContext = this.conversationContextService.resolve(body.message, history);
    const outcome = await this.searchService.searchRelevantChunks(conversationContext.resolvedQuestion, 3);
    const { analysis, results: chunks } = outcome;
    const sources = this.buildSources(chunks, analysis);

    if (chunks.length === 0) {
      this.logger.log(
        `chat mode=no-context intent=${analysis.intent} topic=${conversationContext.activeTopic} followUp=${conversationContext.isFollowUp} question="${body.message}" resolvedQuestion="${conversationContext.resolvedQuestion}"`,
      );
      return { answer: this.noContextAnswer, sources: [] };
    }

    const generation = await this.answerGenerationService.generate({
      question: body.message,
      history,
      analysis,
      chunks,
      conversationContext,
    });

    this.logger.log(
      `chat mode=${generation.mode} intent=${analysis.intent} topic=${conversationContext.activeTopic} followUp=${conversationContext.isFollowUp} question="${body.message}" resolvedQuestion="${conversationContext.resolvedQuestion}" sources=${this.formatSourcesForLog(sources)}`,
    );

    return { answer: generation.answer, sources };
  }

  private buildSources(chunks: SearchResult[], analysis: QueryAnalysis): ChatSourceDto[] {
    const selectedChunks = this.selectSourceChunks(chunks, analysis);
    const seen = new Set<string>();

    return selectedChunks
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

  private selectSourceChunks(chunks: SearchResult[], analysis: QueryAnalysis): SearchResult[] {
    if (analysis.intent === 'summary' && analysis.matchedConcepts.includes('stappenplan')) {
      return chunks
        .filter((chunk) => /Stap [1-4]:/i.test(chunk.metadata.title))
        .sort((a, b) => this.extractStepNumber(a.metadata.title) - this.extractStepNumber(b.metadata.title))
        .slice(0, 4);
    }

    if (analysis.intent === 'comparison' && analysis.matchedConcepts.length >= 2) {
      const selected: SearchResult[] = [];

      for (const concept of analysis.matchedConcepts) {
        const match = chunks.find((chunk) => this.chunkMatchesConcept(chunk, concept));

        if (match && !selected.some((item) => item.id === match.id)) {
          selected.push(match);
        }
      }

      return selected.slice(0, 3);
    }

    if (analysis.intent === 'definition') {
      const topScore = chunks[0]?.score ?? 0;
      return chunks
        .filter((chunk, index) => index < 2 || chunk.score >= Math.max(topScore - 6, 0))
        .slice(0, 2);
    }

    return chunks.slice(0, 3);
  }

  private chunkMatchesConcept(chunk: SearchResult, concept: string): boolean {
    const haystack = `${chunk.metadata.title} ${chunk.metadata.source} ${chunk.content}`.toLowerCase();

    if (concept === 'groepschallenge') {
      return haystack.includes('groepschallenge') || haystack.includes('challenge');
    }

    if (concept === 'individueel project') {
      return haystack.includes('individueel project');
    }

    if (concept === 'portflow') {
      return haystack.includes('portflow') || haystack.includes('portfolio');
    }

    if (concept === 'stappenplan') {
      return /stap [1-4]/i.test(chunk.metadata.title);
    }

    return haystack.includes(concept.toLowerCase());
  }

  private formatSourcesForLog(sources: ChatSourceDto[]): string {
    return sources.map((source) => `${source.title} (${source.score})`).join(', ');
  }

  private extractStepNumber(title: string): number {
    const match = title.match(/Stap (\d+)/i);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
  }
}
