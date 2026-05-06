import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { SearchService } from './search.service';
import { retrievalEvalCases } from './retrieval-eval.data';

async function run(): Promise<void> {
  const logger = new Logger('RetrievalEval');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const searchService = app.get(SearchService);
    let passed = 0;

    for (const testCase of retrievalEvalCases) {
      const outcome = await searchService.searchRelevantChunks(testCase.query, 4);
      const actualTitles = outcome.results.map((result) => result.metadata.title);
      const actualSources = outcome.results.map((result) => result.metadata.source);
      const missingTitles = testCase.expectedTopTitles.filter((title) => !actualTitles.includes(title));
      const forbiddenTitles = (testCase.disallowedTitles ?? []).filter((title) => actualTitles.includes(title));
      const expectedNoHits = testCase.expectedTopTitles.length === 0;
      const unexpectedHits = expectedNoHits && actualTitles.length > 0;
      const sourceMismatch =
        testCase.expectedTopSources?.some((source) => !actualSources.includes(source)) ?? false;
      const intentMismatch = testCase.expectedIntent !== undefined && outcome.analysis.intent !== testCase.expectedIntent;
      const ok =
        missingTitles.length === 0 &&
        forbiddenTitles.length === 0 &&
        !unexpectedHits &&
        !sourceMismatch &&
        !intentMismatch;

      if (ok) {
        passed += 1;
      }

      logger.log(`query: ${testCase.query}`);
      logger.log(`intent: ${outcome.analysis.intent}${testCase.expectedIntent ? ` (expected ${testCase.expectedIntent})` : ''}`);
      logger.log(`expected titles: ${testCase.expectedTopTitles.join(', ') || 'none'}`);
      logger.log(`actual titles: ${actualTitles.join(', ') || 'none'}`);

      if (forbiddenTitles.length > 0) {
        logger.warn(`forbidden titles present: ${forbiddenTitles.join(', ')}`);
      }

      if (missingTitles.length > 0) {
        logger.warn(`missing titles: ${missingTitles.join(', ')}`);
      }

      if (unexpectedHits) {
        logger.warn(`unexpected hits for negative case: ${actualTitles.join(', ')}`);
      }

      if (sourceMismatch && testCase.expectedTopSources) {
        logger.warn(`expected sources not all found: ${testCase.expectedTopSources.join(', ')}`);
      }

      logger.log(`result: ${ok ? 'PASS' : 'FAIL'}`);
      logger.log('---');
    }

    logger.log(`summary: ${passed}/${retrievalEvalCases.length} passed`);
    process.exitCode = passed === retrievalEvalCases.length ? 0 : 1;
  } finally {
    await app.close();
  }
}

void run();
