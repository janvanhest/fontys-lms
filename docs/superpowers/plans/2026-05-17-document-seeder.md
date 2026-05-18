# Document Seeder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed the PostgreSQL `documents` table at startup by reading ten Canvas markdown files, chunking them by `##` section, embedding each chunk via Ollama, and persisting results as `DocumentEntity` rows.

**Architecture:** `DocumentEntity` is a TypeORM entity that TypeORM auto-creates via `synchronize: true`. `DocumentSeederService` implements `OnApplicationBootstrap` and runs the full seed pipeline on every start: clear table → read files → parse frontmatter → chunk → embed → save. `DocumentModule` wires the repository and the `EmbeddingService` together. Note on the embedding column: pgvector has no TypeORM `@Column` decorator, and `synchronize: true` only understands native PostgreSQL types. The embedding is stored as `real[]` (`float4[]`) — a native PostgreSQL float array that stores the values correctly and can be cast to `::vector` for similarity queries later.

**Tech Stack:** NestJS 11, TypeORM, PostgreSQL, pgvector (already installed), Node.js `fs/promises` (built-in), no new packages required.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `backend/src/document/document.entity.ts` | TypeORM entity — `documents` table schema |
| Create | `backend/src/document/document-seeder.service.ts` | Exported pure functions + seeder service |
| Create | `backend/src/document/document-seeder.service.spec.ts` | Tests for parsing, chunking, and seed flow |
| Create | `backend/src/document/document.module.ts` | Wires `TypeOrmModule.forFeature`, `EmbeddingModule`, exports seeder |
| Modify | `backend/src/app.module.ts` | Import `DocumentModule` |

---

## Task 1: DocumentEntity

**Files:**
- Create: `backend/src/document/document.entity.ts`

No unit test for this task — a TypeORM entity is a data definition with no logic to test. TypeORM `synchronize: true` validates it at startup.

- [ ] **Step 1: Create the entity**

Create `backend/src/document/document.entity.ts`:

```typescript
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

type DocumentMetadata = {
  source: string;
  title: string;
  url: string;
  chunkIndex: number;
};

@Entity('documents')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'real', array: true, nullable: true })
  embedding!: number[] | null;

  @Column({ type: 'jsonb' })
  metadata!: DocumentMetadata;

  @CreateDateColumn()
  createdAt!: Date;
}
```

> **Note on `embedding` column:** pgvector provides no TypeORM `@Column` decorator, and `synchronize: true` only accepts PostgreSQL types that TypeORM knows. Storing as `real[]` (PostgreSQL `float4[]`) keeps `synchronize: true` working and stores values correctly. For similarity search, cast via `embedding::vector <-> $1`.

- [ ] **Step 2: Commit**

```bash
cd /Users/jhhest/school/fontys-lms
git add backend/src/document/document.entity.ts
git commit -m "feat: add DocumentEntity with float4[] embedding column"
```

---

## Task 2: Write failing tests for DocumentSeederService

**Files:**
- Create: `backend/src/document/document-seeder.service.spec.ts`

- [ ] **Step 1: Create the test file**

Create `backend/src/document/document-seeder.service.spec.ts`:

```typescript
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

  it('saves one DocumentEntity per chunk', async () => {
    mockReaddir.mockResolvedValue(['01_test.md'] as never);
    mockReadFile.mockResolvedValue(SAMPLE_MARKDOWN as never);

    await service.onApplicationBootstrap();

    // SAMPLE_MARKDOWN produces 3 chunks: intro + 2 sections
    expect(mockRepository.save).toHaveBeenCalledTimes(3);
  });

  it('sets chunkIndex to 0-based position within the file', async () => {
    mockReaddir.mockResolvedValue(['01_test.md'] as never);
    mockReadFile.mockResolvedValue(SAMPLE_MARKDOWN as never);

    await service.onApplicationBootstrap();

    expect(mockRepository.save).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        metadata: expect.objectContaining({ chunkIndex: 0 }),
      }),
    );
    expect(mockRepository.save).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        metadata: expect.objectContaining({ chunkIndex: 1 }),
      }),
    );
  });

  it('saves chunk with embedding: null when embedText returns null', async () => {
    mockEmbeddingService.embedText.mockResolvedValue(null);
    mockReaddir.mockResolvedValue(['01_test.md'] as never);
    mockReadFile.mockResolvedValue(SAMPLE_MARKDOWN as never);

    await service.onApplicationBootstrap();

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ embedding: null }),
    );
  });

  it('stores correct metadata from frontmatter', async () => {
    mockReaddir.mockResolvedValue(['01_test.md'] as never);
    mockReadFile.mockResolvedValue(SAMPLE_MARKDOWN as never);

    await service.onApplicationBootstrap();

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({
          source: 'test-source',
          title: 'Test Page',
          url: 'https://example.com/page',
        }),
      }),
    );
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/jhhest/school/fontys-lms/backend && pnpm test document-seeder
```

Expected: `Cannot find module './document-seeder.service'`

---

## Task 3: Implement DocumentSeederService

**Files:**
- Create: `backend/src/document/document-seeder.service.ts`

- [ ] **Step 1: Create the service**

Create `backend/src/document/document-seeder.service.ts`:

```typescript
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Repository } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';
import { DocumentEntity } from './document.entity';

type Frontmatter = { source: string; title: string; url: string };
type Chunk = { title: string; content: string };

export function parseFrontmatter(raw: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const parts = raw.split('---');
  // parts[0] = '' (empty before opening ---)
  // parts[1] = frontmatter block
  // parts[2..] = body (re-join in case body contains ---)
  const fmBlock = parts[1] ?? '';
  const body = parts.slice(2).join('---').trim();

  const frontmatter: Frontmatter = { source: '', title: '', url: '' };
  for (const line of fmBlock.trim().split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key === 'source') frontmatter.source = value;
    if (key === 'title') frontmatter.title = value;
    if (key === 'url') frontmatter.url = value;
  }

  return { frontmatter, body };
}

export function chunkByH2(body: string, pageTitle: string): Chunk[] {
  const parts = body.split(/\n(?=## )/);
  const chunks: Chunk[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('## ')) {
      const firstLine = trimmed.split('\n')[0];
      const title = firstLine.replace(/^## /, '').trim();
      chunks.push({ title, content: trimmed });
    } else {
      chunks.push({ title: pageTitle, content: trimmed });
    }
  }

  return chunks;
}

@Injectable()
export class DocumentSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DocumentSeederService.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seed();
  }

  private async seed(): Promise<void> {
    const contentDir = path.join(process.cwd(), '..', 'canvas_content');
    const allFiles = await fs.readdir(contentDir);
    const mdFiles = allFiles.filter((f) => f.endsWith('.md'));

    await this.documentRepository.createQueryBuilder().delete().execute();
    this.logger.log(`Cleared documents table. Seeding ${mdFiles.length} files from ${contentDir}`);

    for (const file of mdFiles) {
      const raw = await fs.readFile(path.join(contentDir, file), 'utf-8');
      const { frontmatter, body } = parseFrontmatter(raw);
      const chunks = chunkByH2(body, frontmatter.title);

      this.logger.log(`${file}: ${chunks.length} chunk(s)`);

      for (let i = 0; i < chunks.length; i++) {
        const { title, content } = chunks[i];
        const embedding = await this.embeddingService.embedText(content);

        if (embedding === null) {
          this.logger.warn(`${file} chunk ${i} ("${title}"): embedding failed, saving without vector`);
        }

        await this.documentRepository.save({
          content,
          embedding,
          metadata: {
            source: frontmatter.source,
            title: frontmatter.title,
            url: frontmatter.url,
            chunkIndex: i,
          },
        });
      }
    }

    this.logger.log('Seeding complete');
  }
}
```

- [ ] **Step 2: Run tests to confirm they pass**

```bash
cd /Users/jhhest/school/fontys-lms/backend && pnpm test document-seeder
```

Expected: all tests pass (parseFrontmatter: 3, chunkByH2: 5, DocumentSeederService: 5 = 13 total)

- [ ] **Step 3: Run the full test suite**

```bash
pnpm test
```

Expected: all tests pass with no regressions.

- [ ] **Step 4: Commit**

```bash
cd /Users/jhhest/school/fontys-lms
git add backend/src/document/document-seeder.service.ts backend/src/document/document-seeder.service.spec.ts
git commit -m "feat: add DocumentSeederService with frontmatter parsing and chunking"
```

---

## Task 4: DocumentModule and AppModule registration

**Files:**
- Create: `backend/src/document/document.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create DocumentModule**

Create `backend/src/document/document.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingModule } from '../embedding/embedding.module';
import { DocumentEntity } from './document.entity';
import { DocumentSeederService } from './document-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity]), EmbeddingModule],
  providers: [DocumentSeederService],
  exports: [DocumentSeederService],
})
export class DocumentModule {}
```

- [ ] **Step 2: Register DocumentModule in AppModule**

Replace `backend/src/app.module.ts` with:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DocumentModule } from './document/document.module';
import { validate } from './env.validation';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    DatabaseModule,
    HealthModule,
    DocumentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 3: Run full test suite one final time**

```bash
cd /Users/jhhest/school/fontys-lms/backend && pnpm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
cd /Users/jhhest/school/fontys-lms
git add backend/src/document/document.module.ts backend/src/app.module.ts
git commit -m "feat: register DocumentModule in AppModule"
```

---

## Self-Review

**Spec coverage:**
- ✅ `document.entity.ts` — TypeORM entity, table `documents` — Task 1
- ✅ `id` uuid primary generated — Task 1
- ✅ `content` text — Task 1
- ✅ `embedding` nullable (stored as `real[]`, PoC trade-off documented) — Task 1
- ✅ `metadata` jsonb with `{ source, title, url, chunkIndex }` — Task 1
- ✅ `createdAt` via `CreateDateColumn` — Task 1
- ✅ Entity registered via `TypeOrmModule.forFeature` in DocumentModule — Task 4
- ✅ Reads `.md` files from `canvas_content/` via `fs/promises` — Task 3
- ✅ Parses frontmatter without external library — Task 3 (`parseFrontmatter`)
- ✅ URL values with colons parsed correctly (split on first `:`) — Task 3
- ✅ Chunks on `##` sections, intro is chunk 0 with page title — Task 3 (`chunkByH2`)
- ✅ `## ` prefix stripped from section chunk titles — Task 3
- ✅ Chunk index is 0-based per file — Task 3
- ✅ Embeds via `EmbeddingService.embedText()` — Task 3
- ✅ DELETE before seeding (via `createQueryBuilder().delete().execute()`) — Task 3
- ✅ Logs progress per file: chunk count, embedding success/failure — Task 3
- ✅ `null` embedding → saves chunk with `embedding: null`, logs warning — Task 3
- ✅ `OnApplicationBootstrap` — Task 3
- ✅ `document.module.ts` created, exports `DocumentSeederService` — Task 4
- ✅ `EmbeddingModule` imported in `DocumentModule` — Task 4
- ✅ `DocumentModule` imported in `AppModule` — Task 4
- ✅ No external markdown/YAML libraries — confirmed
- ✅ `private readonly`, `Logger via new Logger(ClassName.name)` — Task 3
- ✅ No `any` types — all types explicit

**Placeholder scan:** None found.

**Type consistency:**
- `parseFrontmatter` returns `{ frontmatter: Frontmatter, body: string }` — used correctly in `seed()`
- `chunkByH2` returns `Chunk[]` where `Chunk = { title: string, content: string }` — used correctly in `seed()`
- `DocumentEntity.metadata` is `DocumentMetadata` (`{ source, title, url, chunkIndex: number }`) — `save()` call in `seed()` matches this shape
- `EmbeddingService.embedText` returns `Promise<number[] | null>` — handled correctly: `null` saved as-is, array stored in `embedding`
