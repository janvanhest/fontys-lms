jest.mock('fs/promises');

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as fs from 'fs/promises';
import { Repository } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';
import { DocumentEntity } from './document.entity';
import {
  DocumentSeederService,
  chunkByH2,
  parseFrontmatter,
} from './document-seeder.service';

const mockReaddir = fs.readdir as jest.MockedFunction<typeof fs.readdir>;
const mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;

const SAMPLE_MARKDOWN = `---
source: test-source
title: Test Page
url: https://example.com/page
---

# Test Page

Intro paragraph.

## Section One

Content of section one.

## Section Two

Content of section two.
`;

describe('parseFrontmatter', () => {
  it('extracts source, title and url', () => {
    const { frontmatter } = parseFrontmatter(SAMPLE_MARKDOWN);
    expect(frontmatter.source).toBe('test-source');
    expect(frontmatter.title).toBe('Test Page');
    expect(frontmatter.url).toBe('https://example.com/page');
  });

  it('returns body without the frontmatter block', () => {
    const { body } = parseFrontmatter(SAMPLE_MARKDOWN);
    expect(body).toContain('# Test Page');
    expect(body).not.toContain('source:');
    expect(body).not.toContain('---');
  });

  it('correctly handles url values that contain colons', () => {
    const { frontmatter } = parseFrontmatter(SAMPLE_MARKDOWN);
    expect(frontmatter.url).toBe('https://example.com/page');
  });
});

describe('chunkByH2', () => {
  it('produces an intro chunk with the page title', () => {
    const chunks = chunkByH2(parseFrontmatter(SAMPLE_MARKDOWN).body, 'Test Page');
    expect(chunks[0].title).toBe('Test Page');
    expect(chunks[0].content).toContain('Intro paragraph');
  });

  it('produces one chunk per ## section', () => {
    const chunks = chunkByH2(parseFrontmatter(SAMPLE_MARKDOWN).body, 'Test Page');
    expect(chunks).toHaveLength(3);
  });

  it('strips the ## prefix from section chunk titles', () => {
    const chunks = chunkByH2(parseFrontmatter(SAMPLE_MARKDOWN).body, 'Test Page');
    expect(chunks[1].title).toBe('Section One');
    expect(chunks[2].title).toBe('Section Two');
  });

  it('includes the ## heading line in section chunk content', () => {
    const chunks = chunkByH2(parseFrontmatter(SAMPLE_MARKDOWN).body, 'Test Page');
    expect(chunks[1].content).toContain('## Section One');
  });

  it('skips empty parts', () => {
    const chunks = chunkByH2('## Only Section\n\nContent.', 'Title');
    expect(chunks).toHaveLength(1);
    expect(chunks[0].title).toBe('Only Section');
  });
});

describe('DocumentSeederService', () => {
  let service: DocumentSeederService;
  let mockRepository: jest.Mocked<
    Pick<Repository<DocumentEntity>, 'createQueryBuilder' | 'save'>
  >;
  let mockEmbeddingService: jest.Mocked<Pick<EmbeddingService, 'embedText'>>;
  const mockDeleteExecute = jest.fn().mockResolvedValue({});
  const mockDelete = jest.fn().mockReturnValue({ execute: mockDeleteExecute });

  beforeEach(async () => {
    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({ delete: mockDelete }),
      save: jest.fn().mockResolvedValue({}),
    };
    mockEmbeddingService = {
      embedText: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentSeederService,
        {
          provide: getRepositoryToken(DocumentEntity),
          useValue: mockRepository,
        },
        { provide: EmbeddingService, useValue: mockEmbeddingService },
      ],
    }).compile();

    service = module.get<DocumentSeederService>(DocumentSeederService);
  });

  afterEach(() => jest.clearAllMocks());

  it('clears the documents table before seeding', async () => {
    mockReaddir.mockResolvedValue([] as never);
    await service.onApplicationBootstrap();
    expect(mockDelete).toHaveBeenCalled();
    expect(mockDeleteExecute).toHaveBeenCalled();
  });

  it('saves all chunks for a file in a single batched save call', async () => {
    mockReaddir.mockResolvedValue(['01_test.md'] as never);
    mockReadFile.mockResolvedValue(SAMPLE_MARKDOWN as never);

    await service.onApplicationBootstrap();

    // SAMPLE_MARKDOWN produces 3 chunks: intro + 2 sections — saved in one batch
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ content: expect.any(String) })]),
    );
    const batch = (mockRepository.save as jest.Mock).mock.calls[0][0] as unknown[];
    expect(batch).toHaveLength(3);
  });

  it('sets chunkIndex to 0-based position within the file', async () => {
    mockReaddir.mockResolvedValue(['01_test.md'] as never);
    mockReadFile.mockResolvedValue(SAMPLE_MARKDOWN as never);

    await service.onApplicationBootstrap();

    const batch = (mockRepository.save as jest.Mock).mock.calls[0][0] as Array<{
      metadata: { chunkIndex: number };
    }>;
    expect(batch[0].metadata.chunkIndex).toBe(0);
    expect(batch[1].metadata.chunkIndex).toBe(1);
  });

  it('saves chunk with embedding: null when embedText returns null', async () => {
    mockEmbeddingService.embedText.mockResolvedValue(null);
    mockReaddir.mockResolvedValue(['01_test.md'] as never);
    mockReadFile.mockResolvedValue(SAMPLE_MARKDOWN as never);

    await service.onApplicationBootstrap();

    const batch = (mockRepository.save as jest.Mock).mock.calls[0][0] as Array<{
      embedding: number[] | null;
    }>;
    expect(batch.every((e) => e.embedding === null)).toBe(true);
  });

  it('preserves numeric embeddings for pgvector-backed persistence', async () => {
    mockReaddir.mockResolvedValue(['01_test.md'] as never);
    mockReadFile.mockResolvedValue(SAMPLE_MARKDOWN as never);
    mockEmbeddingService.embedText.mockResolvedValue([0.11, 0.22, 0.33]);

    await service.onApplicationBootstrap();

    const batch = (mockRepository.save as jest.Mock).mock.calls[0][0] as Array<{
      embedding: number[] | null;
    }>;
    expect(batch[0].embedding).toEqual([0.11, 0.22, 0.33]);
  });

  it('stores correct metadata from frontmatter', async () => {
    mockReaddir.mockResolvedValue(['01_test.md'] as never);
    mockReadFile.mockResolvedValue(SAMPLE_MARKDOWN as never);

    await service.onApplicationBootstrap();

    const batch = (mockRepository.save as jest.Mock).mock.calls[0][0] as Array<{
      metadata: { source: string; title: string; url: string };
    }>;
    expect(batch[0].metadata).toMatchObject({
      source: 'test-source',
      title: 'Test Page',
      url: 'https://example.com/page',
    });
  });

  it('skips files with missing frontmatter fields', async () => {
    const missingTitle = `---\nsource: s\ntitle:\nurl: https://example.com\n---\n\n# Page\n\nContent.`;
    mockReaddir.mockResolvedValue(['bad.md'] as never);
    mockReadFile.mockResolvedValue(missingTitle as never);

    await service.onApplicationBootstrap();

    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('logs a warning and skips seeding when canvas_content directory is missing', async () => {
    const enoent = Object.assign(new Error('ENOENT'), { code: 'ENOENT' });
    mockReaddir.mockRejectedValue(enoent);

    await expect(service.onApplicationBootstrap()).resolves.not.toThrow();
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
