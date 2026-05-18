# Chat MUI X + NestJS SSE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a working chat feature with MUI X ChatBox, NestJS SSE streaming, Anthropic tool use, and conversation persistence via Gesprek/Bericht entities.

**Architecture:** A `ChatBox` (from `@mui/x-chat`) in `ChatTab` uses a custom `LmsAdapter` that calls `POST /api/chat/stream` and converts the SSE response into the `ReadableStream<ChatStreamEnvelope>` format ChatBox expects. The NestJS `ChatService` runs a tool-use loop (max 6 iterations) using `StudentContextTool` and `RagTool`, then streams the final answer token by token. `GesprekEntity` and `BerichtEntity` persist conversation history.

**Tech Stack:** NestJS 11 · `@anthropic-ai/sdk` · TypeORM (pgvector) · `@mui/x-chat@9.0.0-alpha.5` + `@mui/x-chat-headless@9.0.0-alpha.5` · React 19 · fetch ReadableStream (SSE)

---

## File Map

### Backend — new files
| File | Responsibility |
|---|---|
| `backend/src/chat/gesprek.entity.ts` | TypeORM entity: gesprekken table |
| `backend/src/chat/bericht.entity.ts` | TypeORM entity: berichten table |
| `backend/src/chat/gesprek.service.ts` | CRUD voor gesprekken + berichten |
| `backend/src/chat/gesprek.service.spec.ts` | Tests for GesprekService |
| `backend/src/chat/tools/student-context.tool.ts` | Returns mock student context JSON |
| `backend/src/chat/tools/student-context.tool.spec.ts` | Tests for StudentContextTool |
| `backend/src/chat/tools/rag.tool.ts` | Vector search via DocumentSearchService |
| `backend/src/chat/tools/rag.tool.spec.ts` | Tests for RagTool |
| `backend/src/chat/chat.service.ts` | Anthropic tool-use loop, async generator |
| `backend/src/chat/chat.service.spec.ts` | Tests for ChatService |
| `backend/src/chat/dto/stream-chat.dto.ts` | DTO for POST /chat/stream |
| `backend/src/chat/chat.controller.ts` | SSE endpoint + gesprekken GET |
| `backend/src/chat/chat.module.ts` | NestJS module wiring |
| `backend/src/document/document-search.service.ts` | pgvector similarity search |
| `backend/src/document/document-search.service.spec.ts` | Tests for DocumentSearchService |

### Backend — modified files
| File | Change |
|---|---|
| `backend/src/document/document.module.ts` | Export `DocumentSearchService` |
| `backend/src/env.validation.ts` | Add `ANTHROPIC_API_KEY` |
| `backend/src/app.module.ts` | Import `ChatModule` |

### Frontend — new files
| File | Responsibility |
|---|---|
| `frontend/src/api/lms.ts` | `LmsAdapter` implementing `ChatAdapter` |

### Frontend — modified files
| File | Change |
|---|---|
| `frontend/src/tabs/chat/ChatTab.tsx` | Replace static UI with ChatBox + LmsAdapter |
| `frontend/src/tabs/chat/ChatTab.stories.tsx` | Update stories for new API |
| `frontend/src/layouts/Sidebar.tsx` | Wire to `GET /api/chat/gesprekken` |
| `frontend/vite.config.ts` | Add proxy `/api` → `http://localhost:3000` |

---

## Task 1: Install @anthropic-ai/sdk and add ANTHROPIC_API_KEY validation

**Files:**
- Modify: `backend/src/env.validation.ts`
- Modify: `backend/.env.example` (if it exists, else root `.env.example`)

- [ ] **Step 1: Install @anthropic-ai/sdk in backend**

```bash
cd backend && pnpm add @anthropic-ai/sdk --ignore-workspace
```

Expected: pnpm installs `@anthropic-ai/sdk` and updates `backend/pnpm-lock.yaml`.

- [ ] **Step 2: Add ANTHROPIC_API_KEY to env.validation.ts**

In `backend/src/env.validation.ts`, add to the `EnvironmentVariables` class after `DATABASE_URL`:

```typescript
@IsString()
@MinLength(1)
ANTHROPIC_API_KEY!: string;
```

Add `MinLength` to the import from `class-validator`.

- [ ] **Step 3: Write the failing test**

In `backend/src/env.validation.spec.ts`, add inside the existing describe block:

```typescript
it('throws when ANTHROPIC_API_KEY is missing', () => {
  expect(() =>
    validate({ ...validEnv, ANTHROPIC_API_KEY: undefined }),
  ).toThrow('ANTHROPIC_API_KEY');
});
```

Where `validEnv` already exists in the test setup — add `ANTHROPIC_API_KEY: 'sk-ant-test'` to it as well so existing tests still pass.

- [ ] **Step 4: Run test to verify it fails**

```bash
cd backend && pnpm test src/env.validation.spec.ts -- --verbose
```

Expected: the new test fails (ANTHROPIC_API_KEY not yet validated).

- [ ] **Step 5: Run test to verify it passes after step 2**

```bash
cd backend && pnpm test src/env.validation.spec.ts -- --verbose
```

Expected: all tests pass.

- [ ] **Step 6: Add to .env.example**

In root `.env.example`, add:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/env.validation.ts backend/src/env.validation.spec.ts backend/package.json backend/pnpm-lock.yaml .env.example
git commit -m "feat: add @anthropic-ai/sdk and ANTHROPIC_API_KEY validation"
```

---

## Task 2: GesprekEntity + BerichtEntity

**Files:**
- Create: `backend/src/chat/gesprek.entity.ts`
- Create: `backend/src/chat/bericht.entity.ts`

- [ ] **Step 1: Create gesprek.entity.ts**

```typescript
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BerichtEntity } from './bericht.entity';

@Entity('gesprekken')
export class GesprekEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  studentId!: string;

  @CreateDateColumn()
  aangemaaktOp!: Date;

  @OneToMany(() => BerichtEntity, (bericht) => bericht.gesprek, { cascade: true })
  berichten!: BerichtEntity[];
}
```

- [ ] **Step 2: Create bericht.entity.ts**

```typescript
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GesprekEntity } from './gesprek.entity';

export type BerichtRol = 'student' | 'assistent';

@Entity('berichten')
export class BerichtEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  gesprekId!: string;

  @Column({ type: 'varchar' })
  rol!: BerichtRol;

  @Column({ type: 'text' })
  inhoud!: string;

  @CreateDateColumn()
  timestamp!: Date;

  @ManyToOne(() => GesprekEntity, (gesprek) => gesprek.berichten, { onDelete: 'CASCADE' })
  gesprek!: GesprekEntity;
}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/chat/gesprek.entity.ts backend/src/chat/bericht.entity.ts
git commit -m "feat: add GesprekEntity and BerichtEntity"
```

---

## Task 3: GesprekService with tests

**Files:**
- Create: `backend/src/chat/gesprek.service.ts`
- Create: `backend/src/chat/gesprek.service.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `backend/src/chat/gesprek.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BerichtEntity } from './bericht.entity';
import { GesprekEntity } from './gesprek.entity';
import { GesprekService } from './gesprek.service';

describe('GesprekService', () => {
  let service: GesprekService;
  let gesprekRepo: jest.Mocked<{
    save: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
  }>;
  let berichtRepo: jest.Mocked<{ save: jest.Mock }>;

  beforeEach(async () => {
    gesprekRepo = { save: jest.fn(), find: jest.fn(), findOne: jest.fn() };
    berichtRepo = { save: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GesprekService,
        { provide: getRepositoryToken(GesprekEntity), useValue: gesprekRepo },
        { provide: getRepositoryToken(BerichtEntity), useValue: berichtRepo },
      ],
    }).compile();

    service = module.get<GesprekService>(GesprekService);
  });

  it('maakNieuwGesprek saves and returns a gesprek with the studentId', async () => {
    const saved = { id: 'g1', studentId: 'student-1', aangemaaktOp: new Date(), berichten: [] };
    gesprekRepo.save.mockResolvedValue(saved);

    const result = await service.maakNieuwGesprek('student-1');

    expect(gesprekRepo.save).toHaveBeenCalledWith({ studentId: 'student-1' });
    expect(result).toBe(saved);
  });

  it('vindGesprekkenVanStudent returns gesprekken ordered by aangemaaktOp DESC', async () => {
    const gesprekken = [{ id: 'g2' }, { id: 'g1' }];
    gesprekRepo.find.mockResolvedValue(gesprekken);

    const result = await service.vindGesprekkenVanStudent('student-1');

    expect(gesprekRepo.find).toHaveBeenCalledWith({
      where: { studentId: 'student-1' },
      order: { aangemaaktOp: 'DESC' },
    });
    expect(result).toBe(gesprekken);
  });

  it('vindGesprekMetBerichten returns gesprek with berichten relation', async () => {
    const gesprek = { id: 'g1', berichten: [] };
    gesprekRepo.findOne.mockResolvedValue(gesprek);

    const result = await service.vindGesprekMetBerichten('g1');

    expect(gesprekRepo.findOne).toHaveBeenCalledWith({
      where: { id: 'g1' },
      relations: ['berichten'],
      order: { berichten: { timestamp: 'ASC' } },
    });
    expect(result).toBe(gesprek);
  });

  it('vindGesprekMetBerichten returns null when not found', async () => {
    gesprekRepo.findOne.mockResolvedValue(null);
    const result = await service.vindGesprekMetBerichten('not-exists');
    expect(result).toBeNull();
  });

  it('voegBerichtToe saves a bericht with gesprekId, rol and inhoud', async () => {
    const saved = { id: 'b1', gesprekId: 'g1', rol: 'student', inhoud: 'Hallo' };
    berichtRepo.save.mockResolvedValue(saved);

    const result = await service.voegBerichtToe('g1', 'student', 'Hallo');

    expect(berichtRepo.save).toHaveBeenCalledWith({ gesprekId: 'g1', rol: 'student', inhoud: 'Hallo' });
    expect(result).toBe(saved);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && pnpm test src/chat/gesprek.service.spec.ts -- --verbose
```

Expected: FAIL — `GesprekService` not found.

- [ ] **Step 3: Implement GesprekService**

Create `backend/src/chat/gesprek.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BerichtEntity, type BerichtRol } from './bericht.entity';
import { GesprekEntity } from './gesprek.entity';

@Injectable()
export class GesprekService {
  constructor(
    @InjectRepository(GesprekEntity)
    private readonly gesprekRepository: Repository<GesprekEntity>,
    @InjectRepository(BerichtEntity)
    private readonly berichtRepository: Repository<BerichtEntity>,
  ) {}

  async maakNieuwGesprek(studentId: string): Promise<GesprekEntity> {
    return this.gesprekRepository.save({ studentId });
  }

  async vindGesprekkenVanStudent(studentId: string): Promise<GesprekEntity[]> {
    return this.gesprekRepository.find({
      where: { studentId },
      order: { aangemaaktOp: 'DESC' },
    });
  }

  async vindGesprekMetBerichten(gesprekId: string): Promise<GesprekEntity | null> {
    return this.gesprekRepository.findOne({
      where: { id: gesprekId },
      relations: ['berichten'],
      order: { berichten: { timestamp: 'ASC' } },
    });
  }

  async voegBerichtToe(
    gesprekId: string,
    rol: BerichtRol,
    inhoud: string,
  ): Promise<BerichtEntity> {
    return this.berichtRepository.save({ gesprekId, rol, inhoud });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && pnpm test src/chat/gesprek.service.spec.ts -- --verbose
```

Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/src/chat/gesprek.service.ts backend/src/chat/gesprek.service.spec.ts
git commit -m "feat: add GesprekService with CRUD for gesprekken and berichten"
```

---

## Task 4: DocumentSearchService

**Files:**
- Create: `backend/src/document/document-search.service.ts`
- Create: `backend/src/document/document-search.service.spec.ts`
- Modify: `backend/src/document/document.module.ts`

- [ ] **Step 1: Write the failing tests**

Create `backend/src/document/document-search.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';
import { DocumentSearchService } from './document-search.service';

describe('DocumentSearchService', () => {
  let service: DocumentSearchService;
  let mockDataSource: jest.Mocked<Pick<DataSource, 'query'>>;
  let mockEmbeddingService: jest.Mocked<Pick<EmbeddingService, 'embedText'>>;

  beforeEach(async () => {
    mockDataSource = { query: jest.fn() };
    mockEmbeddingService = { embedText: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentSearchService,
        { provide: DataSource, useValue: mockDataSource },
        { provide: EmbeddingService, useValue: mockEmbeddingService },
      ],
    }).compile();

    service = module.get<DocumentSearchService>(DocumentSearchService);
  });

  it('returns concatenated content from top-k chunks', async () => {
    mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2]);
    mockDataSource.query.mockResolvedValue([
      { content: 'Chunk A' },
      { content: 'Chunk B' },
    ]);

    const result = await service.findRelevantChunks('beroepstaak', 3);

    expect(result).toBe('Chunk A\n\nChunk B');
    expect(mockDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY embedding'),
      ['{0.1,0.2}', 3],
    );
  });

  it('returns empty string when embedding is null', async () => {
    mockEmbeddingService.embedText.mockResolvedValue(null);

    const result = await service.findRelevantChunks('query', 3);

    expect(result).toBe('');
    expect(mockDataSource.query).not.toHaveBeenCalled();
  });

  it('returns empty string when no documents found', async () => {
    mockEmbeddingService.embedText.mockResolvedValue([0.1]);
    mockDataSource.query.mockResolvedValue([]);

    const result = await service.findRelevantChunks('query', 3);

    expect(result).toBe('');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && pnpm test src/document/document-search.service.spec.ts -- --verbose
```

Expected: FAIL — `DocumentSearchService` not found.

- [ ] **Step 3: Implement DocumentSearchService**

Create `backend/src/document/document-search.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';

type DocumentRow = { content: string };

@Injectable()
export class DocumentSearchService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async findRelevantChunks(query: string, topK: number): Promise<string> {
    const embedding = await this.embeddingService.embedText(query);
    if (!embedding) return '';

    const pgVector = `{${embedding.join(',')}}`;
    const rows = await this.dataSource.query<DocumentRow[]>(
      `SELECT content FROM documents
       WHERE embedding IS NOT NULL
       ORDER BY embedding <-> $1::real[]
       LIMIT $2`,
      [pgVector, topK],
    );

    if (rows.length === 0) return '';
    return rows.map((r) => r.content).join('\n\n');
  }
}
```

- [ ] **Step 4: Export DocumentSearchService from DocumentModule**

In `backend/src/document/document.module.ts`, add `DocumentSearchService` to providers and exports:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingModule } from '../embedding/embedding.module';
import { DocumentSearchService } from './document-search.service';
import { DocumentEntity } from './document.entity';
import { DocumentSeederService } from './document-seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity]), EmbeddingModule],
  providers: [DocumentSeederService, DocumentSearchService],
  exports: [DocumentSeederService, DocumentSearchService],
})
export class DocumentModule {}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd backend && pnpm test src/document/document-search.service.spec.ts -- --verbose
```

Expected: all 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add backend/src/document/document-search.service.ts backend/src/document/document-search.service.spec.ts backend/src/document/document.module.ts
git commit -m "feat: add DocumentSearchService for pgvector similarity search"
```

---

## Task 5: StudentContextTool and RagTool

**Files:**
- Create: `backend/src/chat/tools/student-context.tool.ts`
- Create: `backend/src/chat/tools/student-context.tool.spec.ts`
- Create: `backend/src/chat/tools/rag.tool.ts`
- Create: `backend/src/chat/tools/rag.tool.spec.ts`

- [ ] **Step 1: Write failing tests for StudentContextTool**

Create `backend/src/chat/tools/student-context.tool.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { StudentContextTool } from './student-context.tool';

describe('StudentContextTool', () => {
  let tool: StudentContextTool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentContextTool],
    }).compile();

    tool = module.get<StudentContextTool>(StudentContextTool);
  });

  it('returns a JSON string with student context fields', async () => {
    const result = await tool.execute('student-1');
    const parsed = JSON.parse(result) as Record<string, unknown>;

    expect(parsed).toHaveProperty('student');
    expect(parsed).toHaveProperty('actieveChallenge');
    expect(parsed).toHaveProperty('recenteActiviteiten');
  });

  it('includes the studentId in the result', async () => {
    const result = await tool.execute('s-42');
    const parsed = JSON.parse(result) as { student: { id: string } };

    expect(parsed.student.id).toBe('s-42');
  });
});
```

- [ ] **Step 2: Write failing tests for RagTool**

Create `backend/src/chat/tools/rag.tool.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentSearchService } from '../../document/document-search.service';
import { RagTool } from './rag.tool';

describe('RagTool', () => {
  let tool: RagTool;
  let mockSearch: jest.Mocked<Pick<DocumentSearchService, 'findRelevantChunks'>>;

  beforeEach(async () => {
    mockSearch = { findRelevantChunks: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagTool,
        { provide: DocumentSearchService, useValue: mockSearch },
      ],
    }).compile();

    tool = module.get<RagTool>(RagTool);
  });

  it('delegates to DocumentSearchService with topK=5', async () => {
    mockSearch.findRelevantChunks.mockResolvedValue('Relevante cursusinhoud');

    const result = await tool.execute('beroepstaak software');

    expect(mockSearch.findRelevantChunks).toHaveBeenCalledWith('beroepstaak software', 5);
    expect(result).toBe('Relevante cursusinhoud');
  });

  it('returns empty string when no results found', async () => {
    mockSearch.findRelevantChunks.mockResolvedValue('');

    const result = await tool.execute('onbekend onderwerp');

    expect(result).toBe('');
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd backend && pnpm test src/chat/tools/ -- --verbose
```

Expected: FAIL — tools not found.

- [ ] **Step 4: Implement StudentContextTool**

Create `backend/src/chat/tools/student-context.tool.ts`:

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class StudentContextTool {
  async execute(studentId: string): Promise<string> {
    // Mock student context for PoC — replace when Challenge/Activity entities exist
    const context = {
      student: {
        id: studentId,
        naam: 'Jan van Hest',
        semester: 6,
        opleiding: 'HBO-ICT Open Learning',
      },
      actieveChallenge: {
        titel: 'Full-stack LMS PoC',
        beschrijving: 'Een Activity First LMS bouwen voor Fontys',
        status: 'actief',
      },
      recenteActiviteiten: [
        {
          type: 'OPDRACHT',
          omschrijving: 'NestJS backend met TypeORM opgezet',
          datum: new Date().toISOString().slice(0, 10),
        },
        {
          type: 'CHALLENGE',
          omschrijving: 'Docker Compose omgeving geconfigureerd',
          datum: new Date().toISOString().slice(0, 10),
        },
      ],
    };

    return JSON.stringify(context, null, 2);
  }
}
```

- [ ] **Step 5: Implement RagTool**

Create `backend/src/chat/tools/rag.tool.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { DocumentSearchService } from '../../document/document-search.service';

@Injectable()
export class RagTool {
  constructor(private readonly documentSearchService: DocumentSearchService) {}

  async execute(query: string): Promise<string> {
    return this.documentSearchService.findRelevantChunks(query, 5);
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd backend && pnpm test src/chat/tools/ -- --verbose
```

Expected: all 4 tests pass.

- [ ] **Step 7: Commit**

```bash
git add backend/src/chat/tools/
git commit -m "feat: add StudentContextTool and RagTool"
```

---

## Task 6: ChatService with tool-use loop

**Files:**
- Create: `backend/src/chat/chat.service.ts`
- Create: `backend/src/chat/chat.service.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `backend/src/chat/chat.service.spec.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { RagTool } from './tools/rag.tool';
import { StudentContextTool } from './tools/student-context.tool';
import { ChatService } from './chat.service';
import { GesprekService } from './gesprek.service';

const MOCK_STUDENT_ID = 'mock-student-1';

describe('ChatService', () => {
  let service: ChatService;
  let mockGesprekService: jest.Mocked<
    Pick<GesprekService, 'maakNieuwGesprek' | 'vindGesprekMetBerichten' | 'voegBerichtToe'>
  >;
  let mockStudentContextTool: jest.Mocked<Pick<StudentContextTool, 'execute'>>;
  let mockRagTool: jest.Mocked<Pick<RagTool, 'execute'>>;
  let mockAnthropic: { messages: { create: jest.Mock } };

  beforeEach(async () => {
    mockGesprekService = {
      maakNieuwGesprek: jest.fn().mockResolvedValue({ id: 'g1', berichten: [] }),
      vindGesprekMetBerichten: jest.fn().mockResolvedValue(null),
      voegBerichtToe: jest.fn().mockResolvedValue({}),
    };
    mockStudentContextTool = { execute: jest.fn().mockResolvedValue('{}') };
    mockRagTool = { execute: jest.fn().mockResolvedValue('') };
    mockAnthropic = {
      messages: {
        create: jest.fn().mockResolvedValue({
          stop_reason: 'end_turn',
          content: [{ type: 'text', text: 'Antwoord van de assistent.' }],
        } satisfies Partial<Anthropic.Message>),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: GesprekService, useValue: mockGesprekService },
        { provide: StudentContextTool, useValue: mockStudentContextTool },
        { provide: RagTool, useValue: mockRagTool },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('sk-ant-test') },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    // Inject mock Anthropic client
    (service as unknown as { anthropic: typeof mockAnthropic }).anthropic = mockAnthropic;
  });

  async function collectEvents(gen: AsyncGenerator<{ event: string; data: string }>) {
    const events: Array<{ event: string; data: string }> = [];
    for await (const e of gen) events.push(e);
    return events;
  }

  it('creates a new gesprek when no gesprekId is provided', async () => {
    const gen = service.streamAntwoord(undefined, 'Wat is een beroepstaak?', MOCK_STUDENT_ID);
    await collectEvents(gen);

    expect(mockGesprekService.maakNieuwGesprek).toHaveBeenCalledWith(MOCK_STUDENT_ID);
  });

  it('emits a final event with the assistant text', async () => {
    const gen = service.streamAntwoord(undefined, 'Vraag?', MOCK_STUDENT_ID);
    const events = await collectEvents(gen);

    const finalEvent = events.find((e) => e.event === 'final');
    expect(finalEvent?.data).toBe('Antwoord van de assistent.');
  });

  it('saves student message and assistant message to gesprekService', async () => {
    const gen = service.streamAntwoord(undefined, 'Vraag?', MOCK_STUDENT_ID);
    await collectEvents(gen);

    expect(mockGesprekService.voegBerichtToe).toHaveBeenCalledWith('g1', 'student', 'Vraag?');
    expect(mockGesprekService.voegBerichtToe).toHaveBeenCalledWith(
      'g1',
      'assistent',
      'Antwoord van de assistent.',
    );
  });

  it('executes tools when stop_reason is tool_use', async () => {
    const toolUseResponse: Partial<Anthropic.Message> = {
      stop_reason: 'tool_use',
      content: [
        {
          type: 'tool_use',
          id: 'tu-1',
          name: 'search_course_content',
          input: { query: 'beroepstaak' },
        },
      ],
    };
    const endTurnResponse: Partial<Anthropic.Message> = {
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Na tool gebruik.' }],
    };

    mockAnthropic.messages.create
      .mockResolvedValueOnce(toolUseResponse)
      .mockResolvedValueOnce(endTurnResponse);

    const gen = service.streamAntwoord(undefined, 'Vraag?', MOCK_STUDENT_ID);
    const events = await collectEvents(gen);

    expect(mockRagTool.execute).toHaveBeenCalledWith('beroepstaak');
    expect(events.some((e) => e.event === 'tool_call')).toBe(true);
    expect(events.some((e) => e.event === 'tool_result')).toBe(true);
    expect(events.find((e) => e.event === 'final')?.data).toBe('Na tool gebruik.');
  });

  it('emits fallback final event after 6 iterations without end_turn', async () => {
    const toolUseResponse: Partial<Anthropic.Message> = {
      stop_reason: 'tool_use',
      content: [{ type: 'tool_use', id: 'tu-1', name: 'search_course_content', input: { query: 'q' } }],
    };
    mockAnthropic.messages.create.mockResolvedValue(toolUseResponse);

    const gen = service.streamAntwoord(undefined, 'Vraag?', MOCK_STUDENT_ID);
    const events = await collectEvents(gen);

    expect(mockAnthropic.messages.create).toHaveBeenCalledTimes(6);
    const finalEvent = events.find((e) => e.event === 'final');
    expect(finalEvent?.data).toContain('kon je vraag niet volledig beantwoorden');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd backend && pnpm test src/chat/chat.service.spec.ts -- --verbose
```

Expected: FAIL — `ChatService` not found.

- [ ] **Step 3: Implement ChatService**

Create `backend/src/chat/chat.service.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RagTool } from './tools/rag.tool';
import { StudentContextTool } from './tools/student-context.tool';
import { GesprekService } from './gesprek.service';

export type ChatSseEvent =
  | { event: 'status'; data: string }
  | { event: 'tool_call'; data: string }
  | { event: 'tool_result'; data: string }
  | { event: 'text_delta'; data: string }
  | { event: 'final'; data: string }
  | { event: 'error'; data: string };

const SYSTEM_PROMPT = `Je bent een leerondersteuningsassistent voor Fontys HBO-ICT studenten.
Je helpt studenten met vragen over cursusinhoud en hun voortgang.
Gebruik eerst search_course_content om relevante cursusinhoud op te halen.
Gebruik get_student_context om de actieve challenge en recente activiteiten van de student op te halen.
Combineer beide bronnen in je antwoord. Antwoord altijd in het Nederlands.`;

const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: 'search_course_content',
    description: 'Zoekt naar relevante cursusinhoud op basis van een zoekopdracht.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'De zoekopdracht om cursusinhoud te vinden.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_student_context',
    description: 'Haalt de actieve challenge, recente activiteiten en beroepstaken van de student op.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

@Injectable()
export class ChatService {
  private readonly anthropic: Anthropic;

  constructor(
    private readonly gesprekService: GesprekService,
    private readonly studentContextTool: StudentContextTool,
    private readonly ragTool: RagTool,
    configService: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: configService.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
  }

  async *streamAntwoord(
    gesprekId: string | undefined,
    vraag: string,
    studentId: string,
  ): AsyncGenerator<ChatSseEvent> {
    let gesprek = gesprekId
      ? await this.gesprekService.vindGesprekMetBerichten(gesprekId)
      : null;

    if (!gesprek) {
      gesprek = await this.gesprekService.maakNieuwGesprek(studentId);
      gesprek.berichten = [];
    }

    await this.gesprekService.voegBerichtToe(gesprek.id, 'student', vraag);

    const allMessages: Anthropic.MessageParam[] = [
      ...(gesprek.berichten ?? []).map((b) => ({
        role: b.rol === 'student' ? ('user' as const) : ('assistant' as const),
        content: b.inhoud,
      })),
      { role: 'user' as const, content: vraag },
    ];

    let iterations = 0;

    while (iterations < 6) {
      yield { event: 'status', data: iterations === 0 ? 'Denken...' : 'Verder redeneren...' };

      const response = await this.anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: allMessages,
        tools: TOOL_DEFINITIONS,
      });

      allMessages.push({ role: 'assistant', content: response.content });

      if (response.stop_reason === 'end_turn') {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('');

        for (const char of text) {
          yield { event: 'text_delta', data: char };
        }

        await this.gesprekService.voegBerichtToe(gesprek.id, 'assistent', text);
        yield { event: 'final', data: text };
        return;
      }

      if (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
        );
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of toolUseBlocks) {
          yield { event: 'tool_call', data: JSON.stringify({ name: block.name, input: block.input }) };

          let result: string;
          if (block.name === 'search_course_content') {
            result = await this.ragTool.execute((block.input as { query: string }).query);
          } else if (block.name === 'get_student_context') {
            result = await this.studentContextTool.execute(studentId);
          } else {
            result = 'Onbekende tool';
          }

          yield { event: 'tool_result', data: JSON.stringify({ name: block.name, result }) };
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        }

        allMessages.push({ role: 'user', content: toolResults });
      }

      iterations++;
    }

    const fallback =
      'Ik kon je vraag niet volledig beantwoorden binnen het maximale aantal stappen.';
    await this.gesprekService.voegBerichtToe(gesprek.id, 'assistent', fallback);
    yield { event: 'final', data: fallback };
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd backend && pnpm test src/chat/chat.service.spec.ts -- --verbose
```

Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/src/chat/chat.service.ts backend/src/chat/chat.service.spec.ts
git commit -m "feat: add ChatService with Anthropic tool-use loop and SSE generator"
```

---

## Task 7: ChatController + ChatModule + AppModule wiring

**Files:**
- Create: `backend/src/chat/dto/stream-chat.dto.ts`
- Create: `backend/src/chat/chat.controller.ts`
- Create: `backend/src/chat/chat.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Step 1: Create the DTO**

Create `backend/src/chat/dto/stream-chat.dto.ts`:

```typescript
import { IsOptional, IsString, MinLength } from 'class-validator';

export class StreamChatDto {
  @IsString()
  @MinLength(1)
  vraag!: string;

  @IsOptional()
  @IsString()
  gesprekId?: string;
}
```

- [ ] **Step 2: Create ChatController**

Create `backend/src/chat/chat.controller.ts`:

```typescript
import { Body, Controller, Get, MessageEvent, Post, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { StreamChatDto } from './dto/stream-chat.dto';
import { GesprekService } from './gesprek.service';

const MOCK_STUDENT_ID = 'mock-student-1';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly gesprekService: GesprekService,
  ) {}

  @Post('stream')
  @Sse()
  streamChat(@Body() dto: StreamChatDto): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      (async () => {
        try {
          for await (const event of this.chatService.streamAntwoord(
            dto.gesprekId,
            dto.vraag,
            MOCK_STUDENT_ID,
          )) {
            subscriber.next({ data: event } as MessageEvent);
          }
          subscriber.complete();
        } catch (error: unknown) {
          subscriber.next({
            data: { event: 'error', data: String(error) },
          } as MessageEvent);
          subscriber.complete();
        }
      })();
    });
  }

  @Get('gesprekken')
  async listGesprekken() {
    return this.gesprekService.vindGesprekkenVanStudent(MOCK_STUDENT_ID);
  }
}
```

- [ ] **Step 3: Create ChatModule**

Create `backend/src/chat/chat.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentModule } from '../document/document.module';
import { BerichtEntity } from './bericht.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { GesprekEntity } from './gesprek.entity';
import { GesprekService } from './gesprek.service';
import { RagTool } from './tools/rag.tool';
import { StudentContextTool } from './tools/student-context.tool';

@Module({
  imports: [
    TypeOrmModule.forFeature([GesprekEntity, BerichtEntity]),
    DocumentModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, GesprekService, StudentContextTool, RagTool],
})
export class ChatModule {}
```

- [ ] **Step 4: Register ChatModule in AppModule**

In `backend/src/app.module.ts`, add `ChatModule` to imports:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { DocumentModule } from './document/document.module';
import { validate } from './env.validation';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    DatabaseModule,
    HealthModule,
    DocumentModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 5: Run all backend tests**

```bash
cd backend && pnpm test -- --verbose
```

Expected: all existing tests + new tests pass.

- [ ] **Step 6: Commit**

```bash
git add backend/src/chat/ backend/src/app.module.ts
git commit -m "feat: add ChatModule with SSE endpoint and gesprekken API"
```

---

## Task 8: Vite proxy

**Files:**
- Modify: `frontend/vite.config.ts`

- [ ] **Step 1: Add server.proxy to vite.config.ts**

In `frontend/vite.config.ts`, update the `defineConfig` to add a `server` block. The full file:

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add frontend/vite.config.ts
git commit -m "feat: add vite proxy /api → http://localhost:3000"
```

---

## Task 9: LmsAdapter

**Files:**
- Create: `frontend/src/api/lms.ts`

- [ ] **Step 1: Create LmsAdapter**

Create `frontend/src/api/lms.ts`:

```typescript
import type { ChatAdapter, ChatSendMessageInput } from '@mui/x-chat/headless'
import type { ChatStreamEnvelope } from '@mui/x-chat/headless'
import type { ChatConversation } from '@mui/x-chat/headless'

type BackendSseEvent = {
  event: 'status' | 'tool_call' | 'tool_result' | 'text_delta' | 'final' | 'error'
  data: string
}

function getTextFromMessage(input: ChatSendMessageInput): string {
  for (const part of input.message.parts) {
    if (part.type === 'text') return part.text
  }
  return ''
}

export class LmsAdapter implements ChatAdapter {
  private readonly baseUrl = '/api'

  async listConversations() {
    const res = await fetch(`${this.baseUrl}/chat/gesprekken`)
    if (!res.ok) return { conversations: [] }

    const data = (await res.json()) as Array<{ id: string; aangemaaktOp: string }>
    const conversations: ChatConversation[] = data.map((g) => ({
      id: g.id,
      title: new Date(g.aangemaaktOp).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      lastMessageAt: g.aangemaaktOp,
    }))
    return { conversations }
  }

  async sendMessage(input: ChatSendMessageInput): Promise<ReadableStream<ChatStreamEnvelope>> {
    const vraag = getTextFromMessage(input)

    const response = await fetch(`${this.baseUrl}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vraag, gesprekId: input.conversationId }),
      signal: input.signal,
    })

    if (!response.ok || !response.body) {
      throw new Error(`Chat stream failed: ${response.status}`)
    }

    const messageId = crypto.randomUUID()
    const textPartId = crypto.randomUUID()
    let textStarted = false
    const source = response.body
    const decoder = new TextDecoder()

    return new ReadableStream<ChatStreamEnvelope>({
      async start(controller) {
        controller.enqueue({ chunk: { type: 'start', messageId } })

        const reader = source.getReader()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue

              let parsed: BackendSseEvent
              try {
                parsed = JSON.parse(line.slice(6)) as BackendSseEvent
              } catch {
                continue
              }

              if (parsed.event === 'text_delta') {
                if (!textStarted) {
                  controller.enqueue({ chunk: { type: 'text-start', id: textPartId } })
                  textStarted = true
                }
                controller.enqueue({ chunk: { type: 'text-delta', id: textPartId, delta: parsed.data } })
              } else if (parsed.event === 'final') {
                if (textStarted) {
                  controller.enqueue({ chunk: { type: 'text-end', id: textPartId } })
                }
                controller.enqueue({ chunk: { type: 'finish', messageId, finishReason: 'stop' } })
              } else if (parsed.event === 'error') {
                controller.enqueue({ chunk: { type: 'finish', messageId, finishReason: 'error' } })
              }
            }
          }
        } finally {
          reader.releaseLock()
          controller.close()
        }
      },
    })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/lms.ts
git commit -m "feat: add LmsAdapter implementing MUI X ChatAdapter for SSE streaming"
```

---

## Task 10: ChatTab rewrite with ChatBox

**Files:**
- Modify: `frontend/src/tabs/chat/ChatTab.tsx`
- Modify: `frontend/src/tabs/chat/ChatTab.stories.tsx`

The `chatMessages.ts` file stays as-is for Storybook stories.

- [ ] **Step 1: Rewrite ChatTab.tsx**

Replace the entire contents of `frontend/src/tabs/chat/ChatTab.tsx`:

```typescript
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { ChatBox } from '@mui/x-chat'
import { useMemo } from 'react'
import { LmsAdapter } from '@/api/lms'
import { useLayout } from '@/context/useLayout'

export function ChatTab() {
  const { sidePanelOpen, setSidePanelOpen } = useLayout()
  const adapter = useMemo(() => new LmsAdapter(), [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        backgroundColor: 'background.default',
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Chat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stel een vraag over je challenge, activiteiten of cursusinhoud.
          </Typography>
        </Box>

        <IconButton
          color={sidePanelOpen ? 'primary' : 'default'}
          onClick={() => setSidePanelOpen(!sidePanelOpen)}
          aria-label="Toggle activities panel"
        >
          <ChecklistRtlIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ChatBox adapter={adapter} />
      </Box>
    </Box>
  )
}
```

- [ ] **Step 2: Update ChatTab.stories.tsx**

Replace the entire contents of `frontend/src/tabs/chat/ChatTab.stories.tsx`:

```typescript
import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { LayoutStoryProvider } from '@/storybook/LayoutStoryProvider'
import { ChatTab } from './ChatTab'

const meta: Meta<typeof ChatTab> = {
  title: 'Tabs/ChatTab',
  component: ChatTab,
}

export default meta
type Story = StoryObj<typeof ChatTab>

function ChatFrame({
  sidePanelOpen = false,
  children,
}: {
  sidePanelOpen?: boolean
  children: ReactNode
}) {
  return (
    <LayoutStoryProvider sidePanelOpen={sidePanelOpen}>
      <Box sx={{ height: 640, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </LayoutStoryProvider>
  )
}

export const Default: Story = {
  render: () => (
    <ChatFrame>
      <ChatTab />
    </ChatFrame>
  ),
}

export const SidePanelOpen: Story = {
  render: () => (
    <ChatFrame sidePanelOpen>
      <ChatTab />
    </ChatFrame>
  ),
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/tabs/chat/ChatTab.tsx frontend/src/tabs/chat/ChatTab.stories.tsx
git commit -m "feat: rewrite ChatTab with MUI X ChatBox and LmsAdapter"
```

---

## Task 11: Wire Sidebar to API

**Files:**
- Modify: `frontend/src/layouts/Sidebar.tsx`

- [ ] **Step 1: Rewrite Sidebar.tsx with API wiring**

Replace the entire contents of `frontend/src/layouts/Sidebar.tsx`:

```typescript
import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useLayout } from '@/context/useLayout'

type Gesprek = {
  id: string
  aangemaaktOp: string
}

const sidebarWidth = 190

async function fetchGesprekken(): Promise<Gesprek[]> {
  const res = await fetch('/api/chat/gesprekken')
  if (!res.ok) return []
  return (await res.json()) as Gesprek[]
}

export function Sidebar() {
  const { sidebarOpen } = useLayout()
  const [gesprekken, setGesprekken] = useState<Gesprek[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!sidebarOpen) return
    setLoading(true)
    fetchGesprekken()
      .then(setGesprekken)
      .finally(() => setLoading(false))
  }, [sidebarOpen])

  async function handleNieuwGesprek() {
    const res = await fetch('/api/chat/gesprekken', { method: 'POST' })
    if (!res.ok) return
    const nieuw = (await res.json()) as Gesprek
    setGesprekken((prev) => [nieuw, ...prev])
    setSelectedId(nieuw.id)
  }

  return (
    <Box
      sx={{
        width: sidebarOpen ? sidebarWidth : 0,
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width 0.2s ease',
        borderRight: sidebarOpen ? '1px solid' : '0 solid transparent',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ width: sidebarWidth, height: '100%', p: 2 }}>
        <Stack spacing={2}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNieuwGesprek}
          >
            Nieuw gesprek
          </Button>

          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', letterSpacing: '0.12em' }}
          >
            Gesprekken
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : (
            <List disablePadding sx={{ display: 'grid', gap: 1 }}>
              {gesprekken.map((g) => (
                <ListItemButton
                  key={g.id}
                  selected={g.id === selectedId}
                  onClick={() => setSelectedId(g.id)}
                  sx={{
                    display: 'block',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: g.id === selectedId ? 'action.selected' : 'transparent',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
                    {new Date(g.aangemaaktOp).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Typography>
                  <Chip
                    size="small"
                    label={new Date(g.aangemaaktOp).toLocaleTimeString('nl-NL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    variant="outlined"
                    color="default"
                    sx={{ mt: 0.5 }}
                  />
                </ListItemButton>
              ))}
              {gesprekken.length === 0 && !loading && (
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                  Nog geen gesprekken
                </Typography>
              )}
            </List>
          )}
        </Stack>
      </Box>
    </Box>
  )
}
```

- [ ] **Step 2: Add POST /chat/gesprekken endpoint to ChatController**

In `backend/src/chat/chat.controller.ts`, add a POST endpoint for creating a new gesprek. Add below the `listGesprekken` method:

```typescript
@Post('gesprekken')
async maakNieuwGesprek() {
  return this.gesprekService.maakNieuwGesprek(MOCK_STUDENT_ID);
}
```

Add `Post` to the import from `@nestjs/common` (it's already there from the SSE endpoint).

- [ ] **Step 3: Run full test suite**

```bash
cd backend && pnpm test -- --verbose
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/layouts/Sidebar.tsx backend/src/chat/chat.controller.ts
git commit -m "feat: wire Sidebar to gesprekken API and add POST /chat/gesprekken"
```

---

## Task 12: Add ANTHROPIC_API_KEY to compose.override.yaml

**Files:**
- Modify: `compose.override.yaml`

- [ ] **Step 1: Add ANTHROPIC_API_KEY to backend environment**

In `compose.override.yaml`, add `ANTHROPIC_API_KEY` to the `backend.environment` block:

```yaml
ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
```

The full environment block becomes:

```yaml
environment:
  PORT: 3000
  NODE_ENV: development
  CORS_ORIGINS: http://localhost:5173
  OLLAMA_URL: ${OLLAMA_URL:-http://ollama:11434}
  DATABASE_URL: ${DATABASE_URL}
  ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
```

- [ ] **Step 2: Add to compose.prod.yaml as well**

In `compose.prod.yaml`, add `ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}` to the backend environment block.

- [ ] **Step 3: Commit**

```bash
git add compose.override.yaml compose.prod.yaml
git commit -m "feat: pass ANTHROPIC_API_KEY to backend container via compose"
```
