# Chat — Backend + Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Werkende chatbot-tab met NestJS SSE streaming, Anthropic tool use loop, persistente Gesprek/Bericht entities, en een herwerkende ChatTab + Sidebar gekoppeld aan de echte backend.

**Architecture:** NestJS ChatModule met GesprekService, ChatService (iteratieve tool-lus max 6), DocumentSearchService (pgvector), StudentContextTool en RagTool als injecteerbare providers. Frontend: bestaande ChatTab UI uitgebreid met `useChatStream` hook voor SSE parsing; Sidebar gekoppeld aan `GET /chat/gesprekken`.

**Tech Stack:** NestJS 11 + @Sse() decorator + Observable (rxjs), @anthropic-ai/sdk, TypeORM (uuid PK, cascade), pgvector raw query, React useState + custom hook, fetch ReadableStream SSE parsing.

---

## File Map

**Backend — nieuw:**
- `backend/src/chat/gesprek.entity.ts`
- `backend/src/chat/bericht.entity.ts`
- `backend/src/chat/gesprek.service.ts`
- `backend/src/chat/gesprek.service.spec.ts`
- `backend/src/chat/document-search.service.ts`
- `backend/src/chat/document-search.service.spec.ts`
- `backend/src/chat/student-context.tool.ts`
- `backend/src/chat/student-context.tool.spec.ts`
- `backend/src/chat/rag.tool.ts`
- `backend/src/chat/rag.tool.spec.ts`
- `backend/src/chat/chat.service.ts`
- `backend/src/chat/chat.service.spec.ts`
- `backend/src/chat/dto/send-message.dto.ts`
- `backend/src/chat/chat.controller.ts`
- `backend/src/chat/chat.module.ts`

**Backend — gewijzigd:**
- `backend/src/env.validation.ts` — ANTHROPIC_API_KEY toevoegen
- `backend/src/app.module.ts` — ChatModule importeren

**Frontend — nieuw:**
- `frontend/src/api/chat.ts`
- `frontend/src/hooks/useChatStream.ts`

**Frontend — gewijzigd:**
- `frontend/src/tabs/chat/ChatTab.tsx`
- `frontend/src/layouts/Sidebar.tsx`
- `frontend/.env` + `frontend/.env.example`

---

## Task 1: @anthropic-ai/sdk installeren + ANTHROPIC_API_KEY validatie

**Files:**
- Modify: `backend/package.json` (via pnpm)
- Modify: `backend/src/env.validation.ts`
- Modify: `backend/src/env.validation.spec.ts`

- [ ] **Stap 1: Installeer de Anthropic SDK in de backend**

```bash
cd /path/to/project/backend
pnpm add @anthropic-ai/sdk --ignore-workspace
```

Verwacht output: `+ @anthropic-ai/sdk x.x.x` in de pnpm output.

- [ ] **Stap 2: Schrijf een falende test voor ANTHROPIC_API_KEY**

Voeg toe aan `backend/src/env.validation.spec.ts`, binnen de bestaande describe-structuur:

```typescript
it('throws when ANTHROPIC_API_KEY is missing', () => {
  expect(() =>
    validate({
      NODE_ENV: 'development',
      PORT: '3000',
      CORS_ORIGINS: 'http://localhost:5173',
      OLLAMA_URL: 'http://ollama:11434',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    }),
  ).toThrow('ANTHROPIC_API_KEY')
})

it('passes when ANTHROPIC_API_KEY is present', () => {
  expect(() =>
    validate({
      NODE_ENV: 'development',
      PORT: '3000',
      CORS_ORIGINS: 'http://localhost:5173',
      OLLAMA_URL: 'http://ollama:11434',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      ANTHROPIC_API_KEY: 'sk-ant-test-key',
    }),
  ).not.toThrow()
})
```

- [ ] **Stap 3: Run de test — verwacht FAIL**

```bash
cd backend && pnpm test -- --testPathPattern=env.validation --verbose
```

Verwacht: `FAIL` op de eerste test.

- [ ] **Stap 4: Voeg ANTHROPIC_API_KEY toe aan EnvironmentVariables**

In `backend/src/env.validation.ts`, voeg toe na de `DATABASE_URL` property:

```typescript
@IsString()
@MinLength(1)
ANTHROPIC_API_KEY!: string;
```

Voeg `MinLength` toe aan de import van `class-validator`:

```typescript
import {
  IsIn,
  IsInt,
  IsString,
  IsUrl,
  Matches,
  Max,
  Min,
  MinLength,
  ValidationError,
  validateSync,
} from 'class-validator';
```

- [ ] **Stap 5: Run de test — verwacht PASS**

```bash
pnpm test -- --testPathPattern=env.validation --verbose
```

Verwacht: beide tests groen.

- [ ] **Stap 6: Voeg ANTHROPIC_API_KEY toe aan .env.example**

Voeg toe aan `backend/.env.example` (of root `.env.example`):

```
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

- [ ] **Stap 7: Commit**

```bash
git add backend/src/env.validation.ts backend/src/env.validation.spec.ts backend/package.json backend/pnpm-lock.yaml
git commit -m "feat(chat): install anthropic sdk and add ANTHROPIC_API_KEY env validation"
```

---

## Task 2: GesprekEntity + BerichtEntity + GesprekService

**Files:**
- Create: `backend/src/chat/gesprek.entity.ts`
- Create: `backend/src/chat/bericht.entity.ts`
- Create: `backend/src/chat/gesprek.service.ts`
- Create: `backend/src/chat/gesprek.service.spec.ts`

- [ ] **Stap 1: Maak de GesprekEntity**

Maak `backend/src/chat/gesprek.entity.ts`:

```typescript
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
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

- [ ] **Stap 2: Maak de BerichtEntity**

Maak `backend/src/chat/bericht.entity.ts`:

```typescript
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GesprekEntity } from './gesprek.entity';

export type BerichtRol = 'student' | 'assistent';

@Entity('berichten')
export class BerichtEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  gesprekId!: string;

  @ManyToOne(() => GesprekEntity, (gesprek) => gesprek.berichten, {
    onDelete: 'CASCADE',
  })
  gesprek!: GesprekEntity;

  @Column({ type: 'varchar' })
  rol!: BerichtRol;

  @Column({ type: 'text' })
  inhoud!: string;

  @CreateDateColumn()
  timestamp!: Date;
}
```

- [ ] **Stap 3: Schrijf falende tests voor GesprekService**

Maak `backend/src/chat/gesprek.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BerichtEntity } from './bericht.entity';
import { GesprekEntity } from './gesprek.entity';
import { GesprekService } from './gesprek.service';

describe('GesprekService', () => {
  let service: GesprekService;
  let gesprekRepo: jest.Mocked<Pick<Repository<GesprekEntity>, 'save' | 'find' | 'findOne'>>;
  let berichtRepo: jest.Mocked<Pick<Repository<BerichtEntity>, 'save'>>;

  beforeEach(async () => {
    gesprekRepo = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };
    berichtRepo = {
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GesprekService,
        { provide: getRepositoryToken(GesprekEntity), useValue: gesprekRepo },
        { provide: getRepositoryToken(BerichtEntity), useValue: berichtRepo },
      ],
    }).compile();

    service = module.get<GesprekService>(GesprekService);
  });

  it('maakNieuwGesprek slaat een gesprek op met studentId', async () => {
    const saved = { id: 'uuid-1', studentId: 'student-42', berichten: [] } as GesprekEntity;
    gesprekRepo.save.mockResolvedValue(saved);

    const result = await service.maakNieuwGesprek('student-42');

    expect(gesprekRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ studentId: 'student-42' }),
    );
    expect(result.id).toBe('uuid-1');
  });

  it('vindGesprekkenVanStudent geeft gesprekken terug gesorteerd op datum', async () => {
    const gesprekken = [
      { id: 'g1', studentId: 's1', aangemaaktOp: new Date('2026-05-17') },
      { id: 'g2', studentId: 's1', aangemaaktOp: new Date('2026-05-18') },
    ] as GesprekEntity[];
    gesprekRepo.find.mockResolvedValue(gesprekken);

    const result = await service.vindGesprekkenVanStudent('s1');

    expect(gesprekRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { studentId: 's1' } }),
    );
    expect(result).toHaveLength(2);
  });

  it('vindGesprekMetBerichten geeft null terug als gesprek niet bestaat', async () => {
    gesprekRepo.findOne.mockResolvedValue(null);

    const result = await service.vindGesprekMetBerichten('nonexistent');

    expect(result).toBeNull();
  });

  it('voegBerichtToe slaat een bericht op aan het gesprek', async () => {
    const bericht = {
      id: 'b1',
      gesprekId: 'g1',
      rol: 'student',
      inhoud: 'Hallo',
    } as BerichtEntity;
    berichtRepo.save.mockResolvedValue(bericht);

    const result = await service.voegBerichtToe('g1', 'student', 'Hallo');

    expect(berichtRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ gesprekId: 'g1', rol: 'student', inhoud: 'Hallo' }),
    );
    expect(result.inhoud).toBe('Hallo');
  });
});
```

- [ ] **Stap 4: Run tests — verwacht FAIL**

```bash
cd backend && pnpm test -- --testPathPattern=gesprek.service --verbose
```

Verwacht: `Cannot find module './gesprek.service'`.

- [ ] **Stap 5: Implementeer GesprekService**

Maak `backend/src/chat/gesprek.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BerichtEntity, BerichtRol } from './bericht.entity';
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
    return this.gesprekRepository.save({ studentId, berichten: [] });
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

- [ ] **Stap 6: Run tests — verwacht PASS**

```bash
pnpm test -- --testPathPattern=gesprek.service --verbose
```

Verwacht: 4 tests groen.

- [ ] **Stap 7: Commit**

```bash
git add backend/src/chat/
git commit -m "feat(chat): add GesprekEntity, BerichtEntity and GesprekService"
```

---

## Task 3: DocumentSearchService (pgvector similarity)

**Files:**
- Create: `backend/src/chat/document-search.service.ts`
- Create: `backend/src/chat/document-search.service.spec.ts`

- [ ] **Stap 1: Schrijf falende tests**

Maak `backend/src/chat/document-search.service.spec.ts`:

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

  it('geeft lege string terug als embedText null is', async () => {
    mockEmbeddingService.embedText.mockResolvedValue(null);

    const result = await service.zoekRelevanteChunks('test query');

    expect(result).toBe('');
    expect(mockDataSource.query).not.toHaveBeenCalled();
  });

  it('voert pgvector query uit en combineert content', async () => {
    mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
    mockDataSource.query.mockResolvedValue([
      { content: 'Eerste chunk.' },
      { content: 'Tweede chunk.' },
    ]);

    const result = await service.zoekRelevanteChunks('challenge beschrijving');

    expect(mockDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('<->'),
      expect.arrayContaining([expect.any(String), expect.any(Number)]),
    );
    expect(result).toContain('Eerste chunk.');
    expect(result).toContain('Tweede chunk.');
  });

  it('geeft lege string terug als query geen resultaten heeft', async () => {
    mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2]);
    mockDataSource.query.mockResolvedValue([]);

    const result = await service.zoekRelevanteChunks('onbekend onderwerp');

    expect(result).toBe('');
  });
});
```

- [ ] **Stap 2: Run tests — verwacht FAIL**

```bash
pnpm test -- --testPathPattern=document-search.service --verbose
```

- [ ] **Stap 3: Implementeer DocumentSearchService**

Maak `backend/src/chat/document-search.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmbeddingService } from '../embedding/embedding.service';

type DocumentRow = { content: string };

@Injectable()
export class DocumentSearchService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async zoekRelevanteChunks(query: string, topK = 5): Promise<string> {
    const embedding = await this.embeddingService.embedText(query);
    if (!embedding) return '';

    const vectorLiteral = `[${embedding.join(',')}]`;
    const rows = await this.dataSource.query<DocumentRow[]>(
      `SELECT content
       FROM documents
       WHERE embedding IS NOT NULL
       ORDER BY embedding <-> $1::real[]
       LIMIT $2`,
      [vectorLiteral, topK],
    );

    if (rows.length === 0) return '';
    return rows.map((r) => r.content).join('\n\n---\n\n');
  }
}
```

- [ ] **Stap 4: Run tests — verwacht PASS**

```bash
pnpm test -- --testPathPattern=document-search.service --verbose
```

Verwacht: 3 tests groen.

- [ ] **Stap 5: Commit**

```bash
git add backend/src/chat/document-search.service.ts backend/src/chat/document-search.service.spec.ts
git commit -m "feat(chat): add DocumentSearchService with pgvector similarity search"
```

---

## Task 4: StudentContextTool + RagTool

**Files:**
- Create: `backend/src/chat/student-context.tool.ts`
- Create: `backend/src/chat/student-context.tool.spec.ts`
- Create: `backend/src/chat/rag.tool.ts`
- Create: `backend/src/chat/rag.tool.spec.ts`

- [ ] **Stap 1: Schrijf falende tests voor StudentContextTool**

Maak `backend/src/chat/student-context.tool.spec.ts`:

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

  it('geeft een JSON-string terug met studentId', async () => {
    const result = await tool.execute('student-42');

    const parsed = JSON.parse(result) as Record<string, unknown>;
    expect(parsed).toHaveProperty('studentId', 'student-42');
  });

  it('geeft altijd een parseerbare JSON-string terug', async () => {
    const result = await tool.execute('any-id');
    expect(() => JSON.parse(result)).not.toThrow();
  });
});
```

- [ ] **Stap 2: Schrijf falende tests voor RagTool**

Maak `backend/src/chat/rag.tool.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentSearchService } from './document-search.service';
import { RagTool } from './rag.tool';

describe('RagTool', () => {
  let tool: RagTool;
  let mockSearchService: jest.Mocked<Pick<DocumentSearchService, 'zoekRelevanteChunks'>>;

  beforeEach(async () => {
    mockSearchService = { zoekRelevanteChunks: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagTool,
        { provide: DocumentSearchService, useValue: mockSearchService },
      ],
    }).compile();

    tool = module.get<RagTool>(RagTool);
  });

  it('delegeert de query naar DocumentSearchService', async () => {
    mockSearchService.zoekRelevanteChunks.mockResolvedValue('Relevante inhoud.');

    const result = await tool.execute('wat is een beroepstaak');

    expect(mockSearchService.zoekRelevanteChunks).toHaveBeenCalledWith('wat is een beroepstaak');
    expect(result).toBe('Relevante inhoud.');
  });

  it('geeft lege string terug als geen resultaten', async () => {
    mockSearchService.zoekRelevanteChunks.mockResolvedValue('');

    const result = await tool.execute('onbekende query');

    expect(result).toBe('');
  });
});
```

- [ ] **Stap 3: Run beide tests — verwacht FAIL**

```bash
pnpm test -- --testPathPattern="student-context.tool|rag.tool" --verbose
```

- [ ] **Stap 4: Implementeer StudentContextTool**

Maak `backend/src/chat/student-context.tool.ts`:

```typescript
import { Injectable } from '@nestjs/common';

export const STUDENT_CONTEXT_TOOL_DEF = {
  name: 'get_student_context',
  description:
    'Haalt de actieve challenge, recente activiteiten en beroepstaakkoppelingen op van de student. Gebruik dit als de vraag gaat over de voortgang, challenge of activiteiten van de student.',
  input_schema: {
    type: 'object' as const,
    properties: {
      studentId: { type: 'string', description: 'Het ID van de student' },
    },
    required: ['studentId'],
  },
};

@Injectable()
export class StudentContextTool {
  async execute(studentId: string): Promise<string> {
    // TODO: vervangen door echte TypeORM queries zodra Student/Challenge/Activiteit entities beschikbaar zijn (E-01 t/m E-03)
    return JSON.stringify({
      studentId,
      actieveChallenge: null,
      recenteActiviteiten: [],
      beroepstaakkoppelingen: [],
      notitie: 'Studentdata nog niet beschikbaar — challenges en activiteiten worden in een volgende sprint geïmplementeerd.',
    });
  }
}
```

- [ ] **Stap 5: Implementeer RagTool**

Maak `backend/src/chat/rag.tool.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { DocumentSearchService } from './document-search.service';

export const RAG_TOOL_DEF = {
  name: 'search_course_content',
  description:
    'Zoekt in de geïndexeerde cursusinhoud naar informatie die relevant is voor de vraag. Gebruik dit voor vragen over begrippen, definities, het HBO-i raamwerk of cursusmateriaal.',
  input_schema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'De zoekterm of vraag om relevante cursusinhoud mee te vinden',
      },
    },
    required: ['query'],
  },
};

@Injectable()
export class RagTool {
  constructor(private readonly documentSearchService: DocumentSearchService) {}

  async execute(query: string): Promise<string> {
    return this.documentSearchService.zoekRelevanteChunks(query);
  }
}
```

- [ ] **Stap 6: Run beide tests — verwacht PASS**

```bash
pnpm test -- --testPathPattern="student-context.tool|rag.tool" --verbose
```

Verwacht: 4 tests groen.

- [ ] **Stap 7: Commit**

```bash
git add backend/src/chat/student-context.tool.ts backend/src/chat/student-context.tool.spec.ts backend/src/chat/rag.tool.ts backend/src/chat/rag.tool.spec.ts
git commit -m "feat(chat): add StudentContextTool and RagTool with Anthropic tool definitions"
```

---

## Task 5: ChatService (tool loop + SSE generator)

**Files:**
- Create: `backend/src/chat/chat.service.ts`
- Create: `backend/src/chat/chat.service.spec.ts`
- Create: `backend/src/chat/dto/send-message.dto.ts`

- [ ] **Stap 1: Maak de DTO**

Maak `backend/src/chat/dto/send-message.dto.ts`:

```typescript
import { IsOptional, IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  vraag!: string;

  @IsString()
  @IsOptional()
  gesprekId?: string;
}
```

- [ ] **Stap 2: Schrijf falende tests voor ChatService**

Maak `backend/src/chat/chat.service.spec.ts`:

```typescript
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import Anthropic from '@anthropic-ai/sdk';
import { GesprekEntity } from './gesprek.entity';
import { GesprekService } from './gesprek.service';
import { RagTool } from './rag.tool';
import { StudentContextTool } from './student-context.tool';
import { ChatService, MOCK_STUDENT_ID } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

const makeGesprek = (berichten = []): GesprekEntity =>
  ({ id: 'g1', studentId: MOCK_STUDENT_ID, berichten } as unknown as GesprekEntity);

describe('ChatService', () => {
  let service: ChatService;
  let mockGesprekService: jest.Mocked<
    Pick<GesprekService, 'maakNieuwGesprek' | 'vindGesprekMetBerichten' | 'voegBerichtToe'>
  >;
  let mockStudentTool: jest.Mocked<Pick<StudentContextTool, 'execute'>>;
  let mockRagTool: jest.Mocked<Pick<RagTool, 'execute'>>;
  let mockAnthropicCreate: jest.Mock;

  beforeEach(async () => {
    mockGesprekService = {
      maakNieuwGesprek: jest.fn().mockResolvedValue(makeGesprek()),
      vindGesprekMetBerichten: jest.fn().mockResolvedValue(makeGesprek()),
      voegBerichtToe: jest.fn().mockResolvedValue({}),
    };
    mockStudentTool = { execute: jest.fn().mockResolvedValue('{}') };
    mockRagTool = { execute: jest.fn().mockResolvedValue('') };
    mockAnthropicCreate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: GesprekService, useValue: mockGesprekService },
        { provide: StudentContextTool, useValue: mockStudentTool },
        { provide: RagTool, useValue: mockRagTool },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('sk-ant-test') },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    // Vervang de Anthropic client met een mock
    (service as unknown as { anthropic: { messages: { create: jest.Mock } } }).anthropic = {
      messages: { create: mockAnthropicCreate },
    };
  });

  async function collectEvents(dto: SendMessageDto) {
    const events: Array<{ event: string; data: string }> = [];
    for await (const e of service.streamAntwoord(dto)) {
      events.push(e);
    }
    return events;
  }

  it('stuurt status-event aan het begin', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Antwoord.' }],
    });

    const events = await collectEvents({ vraag: 'Hallo' });

    expect(events[0].event).toBe('status');
  });

  it('stuurt final-event met het antwoord bij end_turn', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Het antwoord.' }],
    });

    const events = await collectEvents({ vraag: 'Wat is een beroepstaak?' });

    const final = events.find((e) => e.event === 'final');
    expect(final?.data).toBe('Het antwoord.');
  });

  it('voert tool call uit en stuurt tool_call + tool_result events', async () => {
    mockAnthropicCreate
      .mockResolvedValueOnce({
        stop_reason: 'tool_use',
        content: [
          { type: 'tool_use', id: 'tc1', name: 'search_course_content', input: { query: 'beroepstaak' } },
        ],
      })
      .mockResolvedValueOnce({
        stop_reason: 'end_turn',
        content: [{ type: 'text', text: 'Gecombineerd antwoord.' }],
      });

    mockRagTool.execute.mockResolvedValue('RAG resultaat.');

    const events = await collectEvents({ vraag: 'Wat is een beroepstaak?' });

    expect(events.some((e) => e.event === 'tool_call')).toBe(true);
    expect(events.some((e) => e.event === 'tool_result')).toBe(true);
    expect(mockRagTool.execute).toHaveBeenCalledWith('beroepstaak');
  });

  it('stopt na max 6 iteraties en stuurt fallback final-event', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'tool_use',
      content: [
        { type: 'tool_use', id: 'tc1', name: 'get_student_context', input: { studentId: 's1' } },
      ],
    });

    const events = await collectEvents({ vraag: 'Eindeloze lus?' });

    const final = events.find((e) => e.event === 'final');
    expect(final).toBeDefined();
    expect(mockAnthropicCreate).toHaveBeenCalledTimes(6);
  });

  it('maakt nieuw gesprek aan als gesprekId ontbreekt', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Hoi.' }],
    });

    await collectEvents({ vraag: 'Hoi' });

    expect(mockGesprekService.maakNieuwGesprek).toHaveBeenCalledWith(MOCK_STUDENT_ID);
  });

  it('laadt bestaand gesprek als gesprekId aanwezig is', async () => {
    mockAnthropicCreate.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'Hoi.' }],
    });

    await collectEvents({ vraag: 'Vervolg', gesprekId: 'g-existing' });

    expect(mockGesprekService.vindGesprekMetBerichten).toHaveBeenCalledWith('g-existing');
  });
});
```

- [ ] **Stap 3: Run tests — verwacht FAIL**

```bash
pnpm test -- --testPathPattern=chat.service --verbose
```

- [ ] **Stap 4: Implementeer ChatService**

Maak `backend/src/chat/chat.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { GesprekEntity } from './gesprek.entity';
import { GesprekService } from './gesprek.service';
import { RAG_TOOL_DEF, RagTool } from './rag.tool';
import { STUDENT_CONTEXT_TOOL_DEF, StudentContextTool } from './student-context.tool';
import { SendMessageDto } from './dto/send-message.dto';

export const MOCK_STUDENT_ID = 'student-mock-001';

export type ChatSseEvent = { event: string; data: string };

const SYSTEM_PROMPT = `Je bent een leercoach-assistent voor het Activity First LMS van Fontys HBO-ICT.
Je helpt studenten hun leervoortgang te begrijpen en te verbeteren.

Aanpak:
1. Gebruik search_course_content voor vragen over begrippen, het HBO-i raamwerk of cursusinhoud.
2. Gebruik get_student_context voor vragen over de specifieke voortgang, challenge of activiteiten van de student.
3. Combineer beide bronnen voor een volledig antwoord.
Antwoord altijd in het Nederlands. Wees concreet en motiverend.`;

@Injectable()
export class ChatService {
  private readonly anthropic: Anthropic;

  constructor(
    private readonly gesprekService: GesprekService,
    private readonly studentContextTool: StudentContextTool,
    private readonly ragTool: RagTool,
    private readonly configService: ConfigService,
  ) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.getOrThrow<string>('ANTHROPIC_API_KEY'),
    });
  }

  async *streamAntwoord(dto: SendMessageDto): AsyncGenerator<ChatSseEvent> {
    const gesprek = await this.getOrCreateGesprek(dto.gesprekId);
    await this.gesprekService.voegBerichtToe(gesprek.id, 'student', dto.vraag);

    const messages = this.buildMessageHistory(gesprek, dto.vraag);
    let iterations = 0;

    while (iterations < 6) {
      yield { event: 'status', data: iterations === 0 ? 'Nadenken...' : 'Tool uitvoeren...' };

      const response = await this.anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages,
        tools: [STUDENT_CONTEXT_TOOL_DEF, RAG_TOOL_DEF],
      });

      messages.push({ role: 'assistant', content: response.content });

      if (response.stop_reason === 'end_turn') {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('');
        await this.gesprekService.voegBerichtToe(gesprek.id, 'assistent', text);
        yield { event: 'final', data: text };
        return;
      }

      if (response.stop_reason === 'tool_use') {
        const toolResults = await this.executeToolCalls(response.content);
        for (const event of toolResults.events) {
          yield event;
        }
        messages.push({ role: 'user', content: toolResults.results });
      }

      iterations++;
    }

    const fallback = 'Ik kon je vraag niet volledig beantwoorden binnen het maximale aantal stappen.';
    await this.gesprekService.voegBerichtToe(gesprek.id, 'assistent', fallback);
    yield { event: 'final', data: fallback };
  }

  private async getOrCreateGesprek(gesprekId: string | undefined): Promise<GesprekEntity> {
    if (gesprekId) {
      const existing = await this.gesprekService.vindGesprekMetBerichten(gesprekId);
      if (existing) return existing;
    }
    return this.gesprekService.maakNieuwGesprek(MOCK_STUDENT_ID);
  }

  private buildMessageHistory(
    gesprek: GesprekEntity,
    nieuweVraag: string,
  ): Anthropic.MessageParam[] {
    const history: Anthropic.MessageParam[] = (gesprek.berichten ?? []).map((b) => ({
      role: b.rol === 'student' ? 'user' : 'assistant',
      content: b.inhoud,
    }));
    history.push({ role: 'user', content: nieuweVraag });
    return history;
  }

  private async executeToolCalls(content: Anthropic.ContentBlock[]): Promise<{
    events: ChatSseEvent[];
    results: Anthropic.ToolResultBlockParam[];
  }> {
    const events: ChatSseEvent[] = [];
    const results: Anthropic.ToolResultBlockParam[] = [];

    for (const block of content) {
      if (block.type !== 'tool_use') continue;

      events.push({ event: 'tool_call', data: JSON.stringify({ name: block.name }) });

      let result: string;
      if (block.name === 'get_student_context') {
        result = await this.studentContextTool.execute(MOCK_STUDENT_ID);
      } else if (block.name === 'search_course_content') {
        result = await this.ragTool.execute((block.input as { query: string }).query);
      } else {
        result = `Onbekende tool: ${block.name}`;
      }

      events.push({ event: 'tool_result', data: JSON.stringify({ name: block.name }) });
      results.push({ type: 'tool_result', tool_use_id: block.id, content: result });
    }

    return { events, results };
  }
}
```

- [ ] **Stap 5: Run tests — verwacht PASS**

```bash
pnpm test -- --testPathPattern=chat.service --verbose
```

Verwacht: 6 tests groen.

- [ ] **Stap 6: Commit**

```bash
git add backend/src/chat/chat.service.ts backend/src/chat/chat.service.spec.ts backend/src/chat/dto/
git commit -m "feat(chat): add ChatService with Anthropic tool loop and SSE async generator"
```

---

## Task 6: ChatController + ChatModule + AppModule

**Files:**
- Create: `backend/src/chat/chat.controller.ts`
- Create: `backend/src/chat/chat.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Stap 1: Maak de ChatController**

Maak `backend/src/chat/chat.controller.ts`:

```typescript
import { Body, Controller, Get, MessageEvent, Post, Sse } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { ChatService, ChatSseEvent } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GesprekService } from './gesprek.service';
import { MOCK_STUDENT_ID } from './chat.service';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly gesprekService: GesprekService,
  ) {}

  @Post('stream')
  @Sse()
  @ApiOperation({ summary: 'Start een SSE-stream voor een chatbericht (FR-13)' })
  stream(@Body() dto: SendMessageDto): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      void (async () => {
        try {
          for await (const event of this.chatService.streamAntwoord(dto)) {
            subscriber.next({ data: JSON.stringify(event) } as MessageEvent);
          }
          subscriber.complete();
        } catch (error: unknown) {
          const errEvent: ChatSseEvent = {
            event: 'error',
            data: error instanceof Error ? error.message : String(error),
          };
          subscriber.next({ data: JSON.stringify(errEvent) } as MessageEvent);
          subscriber.complete();
        }
      })();
    });
  }

  @Get('gesprekken')
  @ApiOperation({ summary: 'Gesprekslijst van de ingelogde student (FR-08)' })
  async getGesprekken() {
    return this.gesprekService.vindGesprekkenVanStudent(MOCK_STUDENT_ID);
  }

  @Get('gesprekken/:id')
  @ApiOperation({ summary: 'Gesprek met berichten op ID (FR-08)' })
  async getGesprek(@Param('id') id: string) {
    return this.gesprekService.vindGesprekMetBerichten(id);
  }
}
```

Voeg `Param` toe aan de import van `@nestjs/common`:

```typescript
import { Body, Controller, Get, MessageEvent, Param, Post, Sse } from '@nestjs/common';
```

- [ ] **Stap 2: Maak de ChatModule**

Maak `backend/src/chat/chat.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmbeddingModule } from '../embedding/embedding.module';
import { BerichtEntity } from './bericht.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DocumentSearchService } from './document-search.service';
import { GesprekEntity } from './gesprek.entity';
import { GesprekService } from './gesprek.service';
import { RagTool } from './rag.tool';
import { StudentContextTool } from './student-context.tool';

@Module({
  imports: [
    TypeOrmModule.forFeature([GesprekEntity, BerichtEntity]),
    EmbeddingModule,
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    GesprekService,
    DocumentSearchService,
    StudentContextTool,
    RagTool,
  ],
})
export class ChatModule {}
```

- [ ] **Stap 3: Voeg ChatModule toe aan AppModule**

In `backend/src/app.module.ts`, voeg `ChatModule` toe:

```typescript
import { ChatModule } from './chat/chat.module';

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

- [ ] **Stap 4: Run alle backend tests — verwacht PASS**

```bash
cd backend && pnpm test -- --verbose
```

Verwacht: alle tests slagen. Let op eventuele TypeScript compile-errors.

- [ ] **Stap 5: Commit**

```bash
git add backend/src/chat/chat.controller.ts backend/src/chat/chat.module.ts backend/src/app.module.ts
git commit -m "feat(chat): add ChatController with SSE endpoint, GET gesprekken, and wire ChatModule"
```

---

## Task 7: Frontend API client + VITE_BACKEND_URL

**Files:**
- Modify: `frontend/.env`
- Modify: `frontend/.env.example` (indien aanwezig)
- Create: `frontend/src/api/chat.ts`

- [ ] **Stap 1: Voeg VITE_BACKEND_URL toe aan de frontend env**

Voeg toe aan `frontend/.env`:

```
VITE_BACKEND_URL=http://localhost:3000
```

Als er een `frontend/.env.example` bestaat, voeg daar hetzelfde toe.

- [ ] **Stap 2: Maak de chat API client**

Maak `frontend/src/api/chat.ts`:

```typescript
const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:3000'

export type GesprekSummary = {
  id: string
  studentId: string
  aangemaaktOp: string
}

export type ChatSseEvent = {
  event: 'status' | 'tool_call' | 'tool_result' | 'final' | 'error'
  data: string
}

export async function fetchGesprekken(): Promise<GesprekSummary[]> {
  const res = await fetch(`${backendUrl}/chat/gesprekken`)
  if (!res.ok) throw new Error(`Gesprekken ophalen mislukt: ${res.status}`)
  return res.json() as Promise<GesprekSummary[]>
}

export async function createGesprek(): Promise<GesprekSummary> {
  const res = await fetch(`${backendUrl}/chat/gesprekken`, { method: 'POST' })
  if (!res.ok) throw new Error(`Gesprek aanmaken mislukt: ${res.status}`)
  return res.json() as Promise<GesprekSummary>
}

export async function* streamChatMessage(
  vraag: string,
  gesprekId?: string,
): AsyncGenerator<ChatSseEvent> {
  const res = await fetch(`${backendUrl}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vraag, gesprekId }),
  })

  if (!res.ok || !res.body) {
    yield { event: 'error', data: `HTTP ${res.status}` }
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const jsonStr = line.slice(5).trim()
      if (!jsonStr) continue
      try {
        yield JSON.parse(jsonStr) as ChatSseEvent
      } catch {
        // ongeldige SSE lijn overslaan
      }
    }
  }
}
```

- [ ] **Stap 3: Commit**

```bash
git add frontend/src/api/chat.ts frontend/.env
git commit -m "feat(chat): add chat API client with SSE stream parser and VITE_BACKEND_URL"
```

---

## Task 8: useChatStream hook + ChatTab rewrite

**Files:**
- Create: `frontend/src/hooks/useChatStream.ts`
- Modify: `frontend/src/tabs/chat/ChatTab.tsx`
- Modify: `frontend/src/tabs/chat/ChatTab.stories.tsx`

- [ ] **Stap 1: Maak de useChatStream hook**

Maak `frontend/src/hooks/useChatStream.ts`:

```typescript
import { useCallback, useRef, useState } from 'react'
import { streamChatMessage } from '@/api/chat'

export type Message = {
  id: string
  role: 'student' | 'assistent'
  content: string
  isStreaming?: boolean
}

export function useChatStream(gesprekId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [statusText, setStatusText] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (vraag: string) => {
      if (isStreaming) return

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'student',
        content: vraag,
      }
      const streamingId = `assistant-${Date.now()}`
      const streamingMsg: Message = {
        id: streamingId,
        role: 'assistent',
        content: '',
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMsg, streamingMsg])
      setIsStreaming(true)
      setStatusText(null)

      try {
        for await (const sseEvent of streamChatMessage(vraag, gesprekId)) {
          if (sseEvent.event === 'status') {
            setStatusText(sseEvent.data)
          } else if (sseEvent.event === 'final') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingId
                  ? { ...m, content: sseEvent.data, isStreaming: false }
                  : m,
              ),
            )
            setStatusText(null)
          } else if (sseEvent.event === 'error') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === streamingId
                  ? { ...m, content: `Fout: ${sseEvent.data}`, isStreaming: false }
                  : m,
              ),
            )
            setStatusText(null)
          }
        }
      } finally {
        setIsStreaming(false)
        setStatusText(null)
      }
    },
    [isStreaming, gesprekId],
  )

  return { messages, isStreaming, statusText, sendMessage }
}
```

- [ ] **Stap 2: Herschrijf ChatTab met de hook**

Vervang de inhoud van `frontend/src/tabs/chat/ChatTab.tsx`:

```typescript
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useRef, useState } from 'react'
import { useLayout } from '@/context/useLayout'
import { useChatStream } from '@/hooks/useChatStream'

type ChatTabProps = {
  gesprekId?: string
}

export function ChatTab({ gesprekId }: ChatTabProps = {}) {
  const { sidePanelOpen, setSidePanelOpen, activeTab } = useLayout()
  const { messages, isStreaming, statusText, sendMessage } = useChatStream(gesprekId)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, statusText])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    setInput('')
    await sendMessage(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
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
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            {activeTab === 'activities' ? 'Activities' : 'Chat'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {statusText ?? 'Stel een vraag over je challenge, activiteiten of cursusinhoud.'}
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

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
        <Stack spacing={2.5}>
          {messages.map((message) => {
            const isStudent = message.role === 'student'
            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1.5,
                  justifyContent: isStudent ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                }}
              >
                {!isStudent && (
                  <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>L</Avatar>
                )}
                <Paper
                  elevation={0}
                  sx={{
                    maxWidth: 680,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: isStudent ? 'grey.100' : 'background.paper',
                  }}
                >
                  {message.isStreaming ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  )}
                </Paper>
                {isStudent && (
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 34, height: 34 }}>S</Avatar>
                )}
              </Box>
            )
          })}
          <div ref={bottomRef} />
        </Stack>
      </Box>

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            placeholder="Typ je vraag..."
            size="small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
          />
          <IconButton
            color="primary"
            aria-label="Send message"
            onClick={() => void handleSend()}
            disabled={isStreaming || !input.trim()}
          >
            <ArrowUpwardIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}
```

- [ ] **Stap 3: Update ChatTab.stories.tsx**

Vervang de inhoud van `frontend/src/tabs/chat/ChatTab.stories.tsx`:

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

- [ ] **Stap 4: Commit**

```bash
git add frontend/src/hooks/useChatStream.ts frontend/src/tabs/chat/ChatTab.tsx frontend/src/tabs/chat/ChatTab.stories.tsx
git commit -m "feat(chat): rewrite ChatTab with useChatStream hook and SSE streaming"
```

---

## Task 9: Sidebar koppelen aan gesprekken API

**Files:**
- Modify: `frontend/src/layouts/Sidebar.tsx`

- [ ] **Stap 1: Herschrijf Sidebar met API data**

Vervang de inhoud van `frontend/src/layouts/Sidebar.tsx`:

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
import { fetchGesprekken, type GesprekSummary } from '@/api/chat'
import { useLayout } from '@/context/useLayout'

const sidebarWidth = 190

export function Sidebar() {
  const { sidebarOpen } = useLayout()
  const [gesprekken, setGesprekken] = useState<GesprekSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!sidebarOpen) return
    setLoading(true)
    fetchGesprekken()
      .then(setGesprekken)
      .catch(() => setGesprekken([]))
      .finally(() => setLoading(false))
  }, [sidebarOpen])

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
          <Button fullWidth variant="contained" startIcon={<AddIcon />}>
            Nieuw gesprek
          </Button>

          <Typography
            variant="overline"
            sx={{ color: 'text.secondary', letterSpacing: '0.12em' }}
          >
            Gesprekken
          </Typography>

          {loading ? (
            <CircularProgress size={20} sx={{ alignSelf: 'center' }} />
          ) : (
            <List disablePadding sx={{ display: 'grid', gap: 1 }}>
              {gesprekken.map((gesprek) => (
                <ListItemButton
                  key={gesprek.id}
                  selected={gesprek.id === selectedId}
                  onClick={() => setSelectedId(gesprek.id)}
                  sx={{
                    display: 'block',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: gesprek.id === selectedId ? 'action.selected' : 'transparent',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
                    Gesprek
                  </Typography>
                  <Chip
                    size="small"
                    label={new Date(gesprek.aangemaaktOp).toLocaleDateString('nl-NL')}
                    variant="outlined"
                    color="default"
                    sx={{ mt: 1 }}
                  />
                </ListItemButton>
              ))}
              {gesprekken.length === 0 && !loading && (
                <Typography variant="caption" color="text.secondary">
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

- [ ] **Stap 2: Commit**

```bash
git add frontend/src/layouts/Sidebar.tsx
git commit -m "feat(chat): wire Sidebar to GET /chat/gesprekken API"
```

---

## Spec coverage check

| FR | Taak |
|----|------|
| FR-04 Chatbot raadplegen | Task 5 (ChatService + RAG + studentcontext) |
| FR-08 Gespreksgeschiedenis bewaren | Task 2 (GesprekEntity + BerichtEntity + GesprekService) |
| FR-08 Gesprekken bekijken | Task 6 (GET /chat/gesprekken), Task 9 (Sidebar) |
| FR-13 Streaming via SSE | Task 6 (@Sse controller), Task 7-8 (fetch + ReadableStream) |
| FR-14 Hybride redeneren | Task 4-5 (tool loop max 6 iteraties, RAG + studentcontext) |
| NFR-07 Foutafhandeling | Task 6 (error SSE event in controller), Task 8 (error state in hook) |
