import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DocumentEntity } from '../database/document.entity';
import { EmbeddingService } from '../embedding/embedding.service';
import { expandDomainTerms } from './domain-vocabulary';

export interface SearchResult {
  id: string;
  content: string;
  metadata: DocumentEntity['metadata'];
  score: number;
}

export type QueryIntent = 'summary' | 'specific' | 'definition' | 'comparison' | 'unknown';

export interface QueryAnalysis {
  intent: QueryIntent;
  raw: string;
  normalized: string;
  tokens: string[];
  distinctiveTokens: string[];
  focusTerms: string[];
  matchedConcepts: string[];
  titleHints: string[];
}

export interface SearchOutcome {
  analysis: QueryAnalysis;
  results: SearchResult[];
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly stopWords = new Set([
    'aan',
    'about',
    'als',
    'and',
    'at',
    'bij',
    'dan',
    'dat',
    'de',
    'den',
    'der',
    'dit',
    'een',
    'en',
    'for',
    'ga',
    'gaat',
    'het',
    'hoe',
    'hun',
    'ik',
    'in',
    'is',
    'je',
    'kan',
    'kort',
    'maar',
    'met',
    'mij',
    'of',
    'om',
    'ons',
    'ook',
    'op',
    'over',
    'samenvatting',
    'te',
    'that',
    'the',
    'this',
    'to',
    'tot',
    'van',
    'vat',
    'wat',
    'welke',
    'wie',
    'why',
    'wordt',
    'werk',
    'werken',
    'werkt',
    'you',
    'your',
    'zich',
    'zo',
  ]);
  private readonly genericTokens = new Set([
    'doen',
    'gaat',
    'moet',
    'stap',
    'stappen',
    'vraag',
    'werken',
    'werkt',
    'werk',
  ]);
  private readonly minTopScore = 6;
  private readonly minCompetitiveSecondScore = 3;

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async searchRelevantChunks(message: string, limit = 3): Promise<SearchOutcome> {
    const analysis = this.analyzeQuery(message);
    const effectiveLimit = this.getEffectiveLimit(analysis, limit);
    const embeddedQuery = await this.embeddingService.embedText(message);

    if (embeddedQuery) {
      try {
        const vectorResults = await this.searchByVector(embeddedQuery, effectiveLimit);
        const vectorDecision = this.evaluateConfidence(vectorResults, analysis);

        if (vectorDecision.accepted && !this.shouldPreferKeywordFallback(vectorResults, analysis)) {
          this.logger.log(
            `retrieval mode=vector intent=${analysis.intent} concepts=${analysis.matchedConcepts.join('|') || 'none'} question="${message}" hits=${this.formatResultsForLog(vectorResults)}`,
          );
          return { analysis, results: vectorResults };
        }

        if (!vectorDecision.accepted) {
          this.logger.log(
            `retrieval mode=vector no-match reason=${vectorDecision.reason} intent=${analysis.intent} question="${message}"`,
          );
        }
      } catch (error) {
        this.logger.warn(
          `Vector search mislukt, keyword fallback wordt gebruikt: ${
            error instanceof Error ? error.message : 'onbekende fout'
          }`,
        );
      }
    }

    const keywordResults = await this.searchByKeywords(analysis, effectiveLimit);

    if (analysis.intent === 'summary' && analysis.matchedConcepts.includes('stappenplan')) {
      const bundledSteps = this.bundleStepSummary(keywordResults);

      if (bundledSteps.length >= 3) {
        this.logger.log(
          `retrieval mode=keyword intent=${analysis.intent} concepts=${analysis.matchedConcepts.join('|') || 'none'} question="${message}" hits=${this.formatResultsForLog(bundledSteps)}`,
        );
        return { analysis, results: bundledSteps };
      }

      this.logger.log(
        `retrieval mode=keyword no-match reason=missing-step-coverage intent=${analysis.intent} question="${message}"`,
      );
      return { analysis, results: [] };
    }

    if (analysis.intent === 'comparison' && analysis.matchedConcepts.length >= 2) {
      const bundledComparison = this.bundleComparisonResults(keywordResults, analysis);
      const comparisonDecision = this.evaluateConfidence(bundledComparison, analysis);

      if (bundledComparison.length >= 2 && comparisonDecision.accepted) {
        this.logger.log(
          `retrieval mode=keyword intent=${analysis.intent} concepts=${analysis.matchedConcepts.join('|')} question="${message}" hits=${this.formatResultsForLog(bundledComparison)}`,
        );
        return { analysis, results: bundledComparison };
      }

      this.logger.log(
        `retrieval mode=keyword no-match reason=${comparisonDecision.reason ?? 'concept-mismatch'} intent=${analysis.intent} concepts=${analysis.matchedConcepts.join('|')} question="${message}"`,
      );
      return { analysis, results: [] };
    }

    if (analysis.intent === 'definition' && analysis.matchedConcepts.includes('portflow')) {
      const portflowResults = keywordResults.filter((result) => this.resultMatchesConcept(result, 'portflow'));

      if (portflowResults.length > 0) {
        this.logger.log(
          `retrieval mode=keyword intent=${analysis.intent} concepts=${analysis.matchedConcepts.join('|')} question="${message}" hits=${this.formatResultsForLog(portflowResults.slice(0, effectiveLimit))}`,
        );
        return { analysis, results: portflowResults.slice(0, effectiveLimit) };
      }

      this.logger.log(
        `retrieval mode=keyword no-match reason=portflow-no-hit intent=${analysis.intent} concepts=${analysis.matchedConcepts.join('|')} question="${message}" topHits=${this.formatResultsForLog(keywordResults)}`,
      );
      return { analysis, results: [] };
    }

    const keywordDecision = this.evaluateConfidence(keywordResults, analysis);

    if (!keywordDecision.accepted) {
      this.logger.log(
        `retrieval mode=keyword no-match reason=${keywordDecision.reason} intent=${analysis.intent} concepts=${analysis.matchedConcepts.join('|') || 'none'} question="${message}"`,
      );
      return { analysis, results: [] };
    }

    this.logger.log(
      `retrieval mode=keyword intent=${analysis.intent} concepts=${analysis.matchedConcepts.join('|') || 'none'} question="${message}" hits=${this.formatResultsForLog(keywordResults)}`,
    );

    return { analysis, results: keywordResults };
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

  private async searchByKeywords(analysis: QueryAnalysis, limit: number): Promise<SearchResult[]> {
    const documents = await this.documentRepository.find();

    return documents
      .map((document) => ({
        id: document.id,
        content: document.content,
        metadata: document.metadata,
        score: this.keywordScore(document, analysis),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private analyzeQuery(input: string): QueryAnalysis {
    const normalized = input.toLowerCase().trim();
    const rawTokens = normalized
      .split(/[^a-z0-9]+/i)
      .filter((part) => part.length > 1);
    const tokens = rawTokens.filter((part) => part.length > 2 && !this.stopWords.has(part));
    const expansion = expandDomainTerms(normalized, tokens);
    const intent = this.detectIntent(normalized);

    return {
      intent,
      raw: input,
      normalized,
      tokens,
      distinctiveTokens: tokens.filter((token) => token.length >= 5 && !this.genericTokens.has(token)),
      focusTerms: expansion.expandedTerms,
      matchedConcepts: expansion.matchedConcepts,
      titleHints: expansion.titleHints,
    };
  }

  private detectIntent(normalized: string): QueryIntent {
    if (/(vat|samenvat|samenvatten|overzicht|korte stappen|kort samengevat|kort uit)/.test(normalized)) {
      return 'summary';
    }

    if (/(verschil|vergelijk|versus|vergeleken)/.test(normalized)) {
      return 'comparison';
    }

    if (/^(wat is|wat zijn|wie is|definieer|leg uit wat|waar staat)/.test(normalized)) {
      return 'definition';
    }

    if (/(wanneer|moet|hoeveel|hoe vaak|welke|wat moet)/.test(normalized)) {
      return 'specific';
    }

    return 'unknown';
  }

  private getEffectiveLimit(analysis: QueryAnalysis, limit: number): number {
    if (analysis.intent === 'summary' && analysis.matchedConcepts.includes('stappenplan')) {
      return 6;
    }

    if (analysis.intent === 'definition' && analysis.matchedConcepts.includes('portflow')) {
      return Math.max(limit, 6);
    }

    if (analysis.intent === 'comparison' && analysis.matchedConcepts.length >= 2) {
      return Math.max(limit, 6);
    }

    return limit;
  }

  private shouldPreferKeywordFallback(results: SearchResult[], analysis: QueryAnalysis): boolean {
    if (analysis.intent === 'summary' && analysis.matchedConcepts.includes('stappenplan')) {
      const matchedSteps = this.bundleStepSummary(results);
      return matchedSteps.length < 3;
    }

    return false;
  }

  private keywordScore(document: DocumentEntity, analysis: QueryAnalysis): number {
    const title = document.metadata.title.toLowerCase();
    const source = document.metadata.source.toLowerCase();
    const content = document.content.toLowerCase();
    let score = 0;

    for (const hint of analysis.titleHints) {
      if (document.metadata.title === hint) {
        score += 10;
      } else if (title.includes(hint.toLowerCase())) {
        score += 6;
      }
    }

    for (const term of analysis.focusTerms) {
      if (title === term || title.includes(term)) {
        score += 6;
      }

      if (source.includes(term)) {
        score += 3;
      }

      if (content.includes(term)) {
        score += 2;
      }
    }

    for (const term of analysis.tokens) {
      if (title.includes(term)) {
        score += 4;
      }

      if (source.includes(term)) {
        score += 2;
      }

      if (content.includes(term)) {
        score += 1;
      }
    }

    score += this.intentBonus(document, analysis);

    return score;
  }

  private intentBonus(document: DocumentEntity, analysis: QueryAnalysis): number {
    const title = document.metadata.title.toLowerCase();
    const source = document.metadata.source.toLowerCase();
    let bonus = 0;

    if (analysis.intent === 'summary' && analysis.matchedConcepts.includes('stappenplan')) {
      if (/stap [1-4]:/i.test(document.metadata.title)) {
        bonus += 8;
      }

      if (title.includes('introductie stappenplan')) {
        bonus += 3;
      }

      if (source.includes('stappenplan')) {
        bonus += 2;
      }
    }

    if (analysis.intent === 'definition') {
      if (title.includes('introductie') || /^wat is/i.test(document.metadata.title)) {
        bonus += 5;
      }

      if (analysis.matchedConcepts.includes('portflow') && (title.includes('portflow') || source.includes('portflow'))) {
        bonus += 8;
      }
    }

    if (analysis.intent === 'specific') {
      if (
        title.includes('wanneer') ||
        title.includes('verplicht') ||
        title.includes('richtlijnen') ||
        title.includes('eisen')
      ) {
        bonus += 5;
      }
    }

    if (analysis.intent === 'comparison') {
      if (analysis.matchedConcepts.includes('groepschallenge') && title.includes('groepschallenge')) {
        bonus += 4;
      }

      if (analysis.matchedConcepts.includes('individueel project') && title.includes('individueel project')) {
        bonus += 4;
      }

      if (analysis.matchedConcepts.includes('groepschallenge') && (title.includes('challenge') || source.includes('groepschallenge'))) {
        bonus += 3;
      }

      if (analysis.matchedConcepts.includes('individueel project') && source.includes('individueel project')) {
        bonus += 3;
      }
    }

    return bonus;
  }

  private evaluateConfidence(
    results: SearchResult[],
    analysis: QueryAnalysis,
  ): { accepted: boolean; reason?: 'low-score' | 'concept-mismatch' | 'missing-step-coverage' } {
    const top = results[0];

    if (!top || top.score < this.minTopScore) {
      return { accepted: false, reason: 'low-score' };
    }

    const second = results[1];
    const hasSupportingHit = !second || second.score >= this.minCompetitiveSecondScore;

    if (!hasSupportingHit && analysis.intent !== 'definition' && analysis.intent !== 'comparison') {
      return { accepted: false, reason: 'low-score' };
    }

    if (analysis.matchedConcepts.length > 0 && !this.hasConceptMatch(results, analysis)) {
      return { accepted: false, reason: 'concept-mismatch' };
    }

    if (analysis.matchedConcepts.length === 0 && !this.hasDistinctiveTokenCoverage(results, analysis)) {
      return { accepted: false, reason: 'low-score' };
    }

    return { accepted: true };
  }

  private hasDistinctiveTokenCoverage(results: SearchResult[], analysis: QueryAnalysis): boolean {
    if (analysis.distinctiveTokens.length === 0) {
      return true;
    }

    return analysis.distinctiveTokens.some((token) =>
      results.some((result) => {
        const haystack = `${result.metadata.title} ${result.metadata.source} ${result.content}`.toLowerCase();
        return haystack.includes(token);
      }),
    );
  }

  private hasConceptMatch(results: SearchResult[], analysis: QueryAnalysis): boolean {
    if (analysis.intent === 'comparison' && analysis.matchedConcepts.length >= 2) {
      return analysis.matchedConcepts.every((concept) =>
        results.some((result) => this.resultMatchesConcept(result, concept)),
      );
    }

    const haystacks = results.map((result) =>
      `${result.metadata.title} ${result.metadata.source} ${result.content}`.toLowerCase(),
    );

    return analysis.matchedConcepts.every((concept) =>
      haystacks.some((haystack) => haystack.includes(concept.toLowerCase()) || this.matchesConceptAlias(haystack, concept)),
    );
  }

  private matchesConceptAlias(haystack: string, concept: string): boolean {
    if (concept === 'persoonlijke ontwikkeling') {
      return haystack.includes('inhoud en po') || haystack.includes('wanneer is po verplicht');
    }

    if (concept === 'persoonlijk semesterplan') {
      return haystack.includes('semesterplan');
    }

    if (concept === 'stappenplan') {
      return haystack.includes('stap 1') || haystack.includes('stap 2') || haystack.includes('stap 3') || haystack.includes('stap 4');
    }

    if (concept === 'portflow') {
      return (
        haystack.includes('portflow') ||
        haystack.includes('portfolio tool') ||
        haystack.includes('portfolio') ||
        haystack.includes('canvas - portflow')
      );
    }

    return false;
  }

  private resultMatchesConcept(result: SearchResult, concept: string): boolean {
    const haystack = `${result.metadata.title} ${result.metadata.source} ${result.content}`.toLowerCase();
    return haystack.includes(concept.toLowerCase()) || this.matchesConceptAlias(haystack, concept);
  }

  private bundleComparisonResults(results: SearchResult[], analysis: QueryAnalysis): SearchResult[] {
    const bundled: SearchResult[] = [];

    for (const concept of analysis.matchedConcepts) {
      const match = results.find((result) => this.resultMatchesConcept(result, concept));

      if (match && !bundled.some((item) => item.id === match.id)) {
        bundled.push(match);
      }
    }

    return bundled.sort((a, b) => b.score - a.score);
  }

  private bundleStepSummary(results: SearchResult[]): SearchResult[] {
    const stepMap = new Map<number, SearchResult>();

    for (const result of results) {
      const match = result.metadata.title.match(/Stap (\d+)/i);

      if (!match) {
        continue;
      }

      const step = Number(match[1]);
      const current = stepMap.get(step);

      if (!current || result.score > current.score) {
        stepMap.set(step, result);
      }
    }

    return [1, 2, 3, 4]
      .map((step) => stepMap.get(step))
      .filter((result): result is SearchResult => Boolean(result));
  }

  private formatResultsForLog(results: SearchResult[]): string {
    if (results.length === 0) {
      return 'none';
    }

    return results
      .map((result) => `${result.metadata.title} [${result.metadata.source}] (${result.score.toFixed(3)})`)
      .join(', ');
  }
}
