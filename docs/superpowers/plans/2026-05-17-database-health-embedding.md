# Database, Health & Embedding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up TypeORM + pgvector, extend the health check with a real DB ping via @nestjs/terminus, and add an Ollama embedding service.

**Architecture:** Three independent NestJS modules are added to the existing `AppModule`. `DatabaseModule` wraps TypeORM and is global so any future feature module can declare its own entities. `HealthModule` is extended to inject `TypeOrmHealthIndicator` from Terminus. `EmbeddingModule` exposes `EmbeddingService` which calls Ollama via native `fetch` and returns `null` on any failure instead of throwing.

**Tech Stack:** NestJS 11, TypeORM 0.3.x, pg, pgvector, @nestjs/terminus, native fetch (Node 18+), pnpm

---

## File Map

| Action   | Path                                                              | Responsibility                               |
|----------|-------------------------------------------------------------------|----------------------------------------------|
| Modify   | `backend/src/env.validation.ts`                                   | Add `DATABASE_URL` field with `@IsUrl`       |
| Modify   | `backend/src/env.validation.spec.ts`                              | Add `DATABASE_URL` test cases, fix defaults  |
| Create   | `backend/src/database/database.module.ts`                         | TypeORM `forRootAsync` wired to ConfigService|
| Modify   | `backend/src/app.module.ts`                                       | Import `DatabaseModule`                      |
| Modify   | `backend/src/health/dto/health-check-response.dto.ts`             | Add optional `details` field                 |
| Modify   | `backend/src/health/health.module.ts`                             | Import `TerminusModule`                      |
| Modify   | `backend/src/health/health.service.ts`                            | Async DB ping via `TypeOrmHealthIndicator`   |
| Modify   | `backend/src/health/health.controller.ts`                         | Async return type                            |
| Create   | `backend/src/health/health.service.spec.ts`                       | Unit tests for health service                |
| Create   | `backend/src/embedding/embedding.service.spec.ts`                 | Unit tests for embedding service             |
| Create   | `backend/src/embedding/embedding.service.ts`                      | `embedText()` via native fetch               |
| Create   | `backend/src/embedding/embedding.module.ts`                       | Exports `EmbeddingService`                   |

---

## Task 1: Install packages

**Files:** none (package.json is updated by pnpm)

- [ ] **Step 1: Install runtime dependencies**

```bash
cd backend
pnpm add @nestjs/typeorm typeorm pg pgvector @nestjs/terminus
```

Expected output: packages added to `dependencies` in `package.json`. Verify with:
```bash
grep -E '@nestjs/typeorm|typeorm|pgvector|@nestjs/terminus' package.json
```

- [ ] **Step 2: Commit**

```bash
git add backend/package.json backend/pnpm-lock.yaml
git commit -m "chore: install typeorm, pgvector and terminus packages"
```

---

## Task 2: Add DATABASE_URL to env validation

**Files:**
- Modify: `backend/src/env.validation.ts`
- Modify: `backend/src/env.validation.spec.ts`

- [ ] **Step 1: Add failing tests for DATABASE_URL**

Open `backend/src/env.validation.spec.ts` and replace the entire file content with:

```typescript
import { validate } from './env.validation';

const validBase = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/lms',
};

describe('validate', () => {
  it('applies defaults for runtime config', () => {
    const config = validate({ ...validBase });

    expect(config.NODE_ENV).toBe('development');
    expect(config.PORT).toBe(3000);
    expect(config.CORS_ORIGINS).toBe('http://localhost:5173');
    expect(config.OLLAMA_URL).toBe('http://ollama:11434');
  });

  it('accepts explicit env values', () => {
    const config = validate({
      ...validBase,
      NODE_ENV: 'test',
      PORT: '4000',
      CORS_ORIGINS: 'http://localhost:5173,https://frontend.example.com',
    });

    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(4000);
    expect(config.CORS_ORIGINS).toBe('http://localhost:5173,https://frontend.example.com');
  });

  it('rejects unsupported node environments', () => {
    expect(() => validate({ ...validBase, NODE_ENV: 'provision' })).toThrow(
      /Environment validation failed/,
    );
    expect(() => validate({ ...validBase, NODE_ENV: 'provision' })).toThrow(/"property": "NODE_ENV"/);
  });

  it('rejects invalid ports', () => {
    expect(() => validate({ ...validBase, PORT: '70000' })).toThrow(/Environment validation failed/);
    expect(() => validate({ ...validBase, PORT: '70000' })).toThrow(/"property": "PORT"/);
    expect(() => validate({ ...validBase, PORT: '70000' })).toThrow(/must not be greater than 65535/);
  });

  it('rejects non-numeric port strings', () => {
    expect(() => validate({ ...validBase, PORT: '3000abc' })).toThrow(/Environment validation failed/);
    expect(() => validate({ ...validBase, PORT: '3000abc' })).toThrow(/"property": "PORT"/);
  });

  it('rejects empty port strings', () => {
    expect(() => validate({ ...validBase, PORT: '' })).toThrow(/Environment validation failed/);
    expect(() => validate({ ...validBase, PORT: '' })).toThrow(/"property": "PORT"/);
  });

  it('rejects missing DATABASE_URL', () => {
    expect(() => validate({})).toThrow(/Environment validation failed/);
    expect(() => validate({})).toThrow(/"property": "DATABASE_URL"/);
  });

  it('rejects DATABASE_URL without protocol', () => {
    expect(() => validate({ ...validBase, DATABASE_URL: 'localhost:5432/lms' })).toThrow(
      /Environment validation failed/,
    );
    expect(() =>
      validate({ ...validBase, DATABASE_URL: 'localhost:5432/lms' }),
    ).toThrow(/"property": "DATABASE_URL"/);
  });

  it('accepts DATABASE_URL with protocol and local host', () => {
    expect(() =>
      validate({ ...validBase, DATABASE_URL: 'postgresql://user:pass@db:5432/lms' }),
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend
pnpm test -- --testPathPattern=env.validation.spec
```

Expected: "rejects missing DATABASE_URL" and "rejects DATABASE_URL without protocol" and "accepts DATABASE_URL" tests fail because `DATABASE_URL` doesn't exist in the validation class yet.

- [ ] **Step 3: Add DATABASE_URL to EnvironmentVariables**

Open `backend/src/env.validation.ts`. In the `EnvironmentVariables` class, after the `OLLAMA_URL` field, add:

```typescript
  @IsUrl({
    require_tld: false,
    require_protocol: true,
    protocols: ['postgresql', 'postgres'],
  })
  DATABASE_URL!: string;
```

> **Note:** `protocols` is required because class-validator's `@IsUrl` uses validator.js which by default only accepts `http`, `https`, `ftp`. The `!` (definite assignment) marks it required with no default — the app will refuse to start without a valid DATABASE_URL.

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd backend
pnpm test -- --testPathPattern=env.validation.spec
```

Expected: all tests pass including the three new DATABASE_URL cases.

- [ ] **Step 5: Commit**

```bash
git add backend/src/env.validation.ts backend/src/env.validation.spec.ts
git commit -m "feat: add DATABASE_URL to environment validation"
```

---

## Task 3: Create DatabaseModule

**Files:**
- Create: `backend/src/database/database.module.ts`
- Modify: `backend/src/app.module.ts`

No unit test for this task — the integration is verified by the health check in Task 4, and TypeORM module bootstrap failures surface immediately on `nest start`.

- [ ] **Step 1: Create `backend/src/database/database.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
```

- [ ] **Step 2: Register DatabaseModule in AppModule**

Open `backend/src/app.module.ts` and replace the entire file with:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/database/database.module.ts backend/src/app.module.ts
git commit -m "feat: add DatabaseModule with TypeORM forRootAsync"
```

---

## Task 4: Extend health check with Terminus DB ping

**Files:**
- Modify: `backend/src/health/dto/health-check-response.dto.ts`
- Modify: `backend/src/health/health.module.ts`
- Modify: `backend/src/health/health.service.ts`
- Modify: `backend/src/health/health.controller.ts`
- Create: `backend/src/health/health.service.spec.ts`

- [ ] **Step 1: Write failing tests for HealthService**

Create `backend/src/health/health.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let healthCheckService: jest.Mocked<Pick<HealthCheckService, 'check'>>;
  let db: jest.Mocked<Pick<TypeOrmHealthIndicator, 'pingCheck'>>;

  beforeEach(async () => {
    const mockHealthCheckService = { check: jest.fn() };
    const mockDb = { pingCheck: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: TypeOrmHealthIndicator, useValue: mockDb },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    healthCheckService = module.get(HealthCheckService);
    db = module.get(TypeOrmHealthIndicator);
  });

  it('returns { status: "ok" } when database is healthy', async () => {
    healthCheckService.check.mockResolvedValue({
      status: 'ok',
      details: { database: { status: 'up' } },
    } as never);

    const result = await service.check();

    expect(result).toEqual({ status: 'ok' });
  });

  it('returns { status: "error", details } when database is unhealthy', async () => {
    const causes = { database: { status: 'down', message: 'Connection refused' } };
    healthCheckService.check.mockRejectedValue(
      new HealthCheckError('DB check failed', causes),
    );

    const result = await service.check();

    expect(result).toEqual({ status: 'error', details: causes });
  });

  it('returns { status: "error", details } on unexpected error', async () => {
    healthCheckService.check.mockRejectedValue(new Error('Unexpected'));

    const result = await service.check();

    expect(result.status).toBe('error');
    expect(result.details).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend
pnpm test -- --testPathPattern=health.service.spec
```

Expected: module compile error because `HealthService` doesn't yet inject `HealthCheckService` or `TypeOrmHealthIndicator`.

- [ ] **Step 3: Update HealthCheckResponseDto**

Replace `backend/src/health/dto/health-check-response.dto.ts` entirely:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ example: 'ok', enum: ['ok', 'error'] })
  status!: string;

  @ApiPropertyOptional({ example: { database: { status: 'down', message: 'Connection refused' } } })
  details?: Record<string, unknown>;
}
```

- [ ] **Step 4: Update HealthModule**

Replace `backend/src/health/health.module.ts` entirely:

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
```

- [ ] **Step 5: Implement HealthService with DB ping**

Replace `backend/src/health/health.service.ts` entirely:

```typescript
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  async check(): Promise<HealthCheckResponseDto> {
    try {
      await this.health.check([() => this.db.pingCheck('database')]);
      return { status: 'ok' };
    } catch (error) {
      if (error instanceof HealthCheckError) {
        return { status: 'error', details: error.causes as Record<string, unknown> };
      }
      return { status: 'error', details: { message: String(error) } };
    }
  }
}
```

- [ ] **Step 6: Update HealthController return type**

Replace `backend/src/health/health.controller.ts` entirely:

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheckResponseDto } from './dto/health-check-response.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ type: HealthCheckResponseDto })
  async check(): Promise<HealthCheckResponseDto> {
    return this.healthService.check();
  }
}
```

- [ ] **Step 7: Run tests to confirm they pass**

```bash
cd backend
pnpm test -- --testPathPattern=health.service.spec
```

Expected: all 3 tests pass.

- [ ] **Step 8: Run full test suite**

```bash
cd backend
pnpm test
```

Expected: all tests pass. The `configure-app.spec.ts` and `app.controller.spec.ts` should still pass unmodified.

- [ ] **Step 9: Commit**

```bash
git add \
  backend/src/health/dto/health-check-response.dto.ts \
  backend/src/health/health.module.ts \
  backend/src/health/health.service.ts \
  backend/src/health/health.controller.ts \
  backend/src/health/health.service.spec.ts
git commit -m "feat: extend health check with TypeORM DB ping via terminus"
```

---

## Task 5: Create EmbeddingModule

**Files:**
- Create: `backend/src/embedding/embedding.service.spec.ts`
- Create: `backend/src/embedding/embedding.service.ts`
- Create: `backend/src/embedding/embedding.module.ts`

- [ ] **Step 1: Write failing tests for EmbeddingService**

Create `backend/src/embedding/embedding.service.spec.ts`:

```typescript
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingService } from './embedding.service';

describe('EmbeddingService', () => {
  let service: EmbeddingService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmbeddingService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('http://ollama:11434'),
          },
        },
      ],
    }).compile();

    service = module.get<EmbeddingService>(EmbeddingService);
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns embedding array on successful response', async () => {
    const embedding = [0.1, 0.2, 0.3];
    fetchSpy.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ embedding }),
    } as unknown as Response);

    const result = await service.embedText('hello world');

    expect(result).toEqual(embedding);
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://ollama:11434/api/embeddings',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ model: 'nomic-embed-text', prompt: 'hello world' }),
      }),
    );
  });

  it('returns null when Ollama returns a non-200 response', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 503,
    } as unknown as Response);

    const result = await service.embedText('hello world');

    expect(result).toBeNull();
  });

  it('returns null when fetch throws a network error', async () => {
    fetchSpy.mockRejectedValue(new Error('ECONNREFUSED'));

    const result = await service.embedText('hello world');

    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend
pnpm test -- --testPathPattern=embedding.service.spec
```

Expected: cannot find module `./embedding.service`.

- [ ] **Step 3: Implement EmbeddingService**

Create `backend/src/embedding/embedding.service.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd backend
pnpm test -- --testPathPattern=embedding.service.spec
```

Expected: all 3 tests pass.

- [ ] **Step 5: Create EmbeddingModule**

Create `backend/src/embedding/embedding.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';

@Module({
  providers: [EmbeddingService],
  exports: [EmbeddingService],
})
export class EmbeddingModule {}
```

- [ ] **Step 6: Run full test suite**

```bash
cd backend
pnpm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add \
  backend/src/embedding/embedding.service.ts \
  backend/src/embedding/embedding.service.spec.ts \
  backend/src/embedding/embedding.module.ts
git commit -m "feat: add EmbeddingModule with Ollama embedText via native fetch"
```

---

## Self-Review

**Spec coverage:**
- ✅ Install @nestjs/typeorm, typeorm, pg, pgvector — Task 1
- ✅ DATABASE_URL validated via @IsUrl — Task 2
- ✅ database.module.ts with forRootAsync, autoLoadEntities, synchronize — Task 3
- ✅ DatabaseModule registered in AppModule — Task 3
- ✅ @nestjs/terminus installed — Task 1
- ✅ HealthService replaces TODO with TypeOrmHealthIndicator.pingCheck — Task 4
- ✅ TerminusModule imported in HealthModule — Task 4
- ✅ Swagger annotations preserved (DTO updated, controller unchanged) — Task 4
- ✅ Response shape { status: 'ok' } / { status: 'error', details } — Task 4
- ✅ EmbeddingService.embedText(text): Promise<number[] | null> — Task 5
- ✅ OLLAMA_URL from ConfigService, no hardcoded URL — Task 5
- ✅ Native fetch, no extra HTTP library — Task 5
- ✅ POST ${OLLAMA_URL}/api/embeddings with correct body — Task 5
- ✅ Warning log + return null on failure — Task 5
- ✅ EmbeddingService exported — Task 5
- ✅ No `any` types — all implementations use explicit types
- ✅ private readonly for injected services throughout
- ✅ Logger via new Logger(ClassName.name) — EmbeddingService

**Placeholder scan:** None found.

**Type consistency:**
- `HealthCheckResponseDto.details` is `Record<string, unknown>` in DTO and service — consistent
- `embedText` return type `Promise<number[] | null>` declared in service, matches test expectations — consistent
- `DATABASE_URL` field name consistent across env.validation.ts and database.module.ts (`configService.getOrThrow<string>('DATABASE_URL')`)
