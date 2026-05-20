# DevModule Seed Endpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verplaats het seed endpoint uit `ActivityController` naar een conditionele `DevModule` die alleen buiten productie geladen wordt.

**Architecture:** Een nieuwe `DevModule` met `DevController` wordt conditioneel geregistreerd in `AppModule` via `NODE_ENV !== 'production'`. `ActivityModule` exporteert `ActivityService` zodat `DevModule` hem kan injecteren. Het seed endpoint verhuist van `POST /activities/seed` naar `POST /dev/seed/activities`.

**Tech Stack:** NestJS, Jest

---

## File map

| Actie | Pad | Verantwoordelijkheid |
|---|---|---|
| Create | `backend/src/dev/dev.controller.ts` | `POST /dev/seed/activities` route |
| Create | `backend/src/dev/dev.controller.spec.ts` | Unit test voor DevController |
| Create | `backend/src/dev/dev.module.ts` | NestJS module, importeert ActivityModule |
| Modify | `backend/src/activity/activity.module.ts` | Voeg `ActivityService` toe aan `exports` |
| Modify | `backend/src/activity/activity.controller.ts` | Verwijder `seed` methode |
| Modify | `backend/src/activity/activity.controller.spec.ts` | Verwijder seed test |
| Modify | `backend/src/app.module.ts` | Conditioneel importeer `DevModule` |

---

## Task 1: Exporteer ActivityService vanuit ActivityModule

**Files:**
- Modify: `backend/src/activity/activity.module.ts`

- [ ] **Stap 1: Voeg exports toe aan ActivityModule**

Vervang de volledige inhoud van `backend/src/activity/activity.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Activity])],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
```

- [ ] **Stap 2: Verifieer dat bestaande tests nog slagen**

```bash
cd backend && npx jest activity --no-coverage
```

Verwacht: alle activity tests groen.

- [ ] **Stap 3: Commit**

```bash
git add backend/src/activity/activity.module.ts
git commit -m "feat(activity): export ActivityService from ActivityModule"
```

---

## Task 2: DevController (TDD)

**Files:**
- Create: `backend/src/dev/dev.controller.spec.ts`
- Create: `backend/src/dev/dev.controller.ts`

- [ ] **Stap 1: Schrijf de falende test**

```typescript
// backend/src/dev/dev.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { DevController } from './dev.controller';
import { ActivityService } from '../activity/activity.service';
import { Activity } from '../activity/activity.entity';

const STUDENT_ID = 'student-uuid';
const mockStudent = { id: STUDENT_ID } as any;

const makeActivity = (): Activity =>
  ({
    id: 'act-1',
    studentId: STUDENT_ID,
    portflowId: 7178,
    title: 'Context helder krijgen',
    description: null,
    position: 1,
    type: 'opdracht',
    status: 'open',
    deadline: '2026-03-07',
    competencyLabel: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as Activity;

describe('DevController', () => {
  let controller: DevController;
  let activityService: jest.Mocked<Pick<ActivityService, 'seed'>>;

  beforeEach(async () => {
    activityService = { seed: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevController],
      providers: [{ provide: ActivityService, useValue: activityService }],
    }).compile();

    controller = module.get<DevController>(DevController);
  });

  it('seed roept activityService.seed aan met studentId en retourneert activiteiten', async () => {
    activityService.seed.mockResolvedValue([makeActivity()]);

    const result = await controller.seedActivities(mockStudent);

    expect(activityService.seed).toHaveBeenCalledWith(STUDENT_ID);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Context helder krijgen');
  });
});
```

- [ ] **Stap 2: Draai de test — verwacht: FAIL**

```bash
cd backend && npx jest dev.controller.spec.ts --no-coverage
```

Verwacht: `Cannot find module './dev.controller'`

- [ ] **Stap 3: Implementeer DevController**

```typescript
// backend/src/dev/dev.controller.ts
import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentStudent } from '../auth/decorators/current-student.decorator';
import { ActivityService } from '../activity/activity.service';
import { ActivityResponseDto } from '../activity/dto/activity-response.dto';
import { Student } from '../student/student.entity';

@ApiTags('dev')
@Controller('dev')
export class DevController {
  constructor(private readonly activityService: ActivityService) {}

  @Post('seed/activities')
  @ApiOperation({ summary: 'Seed mockdata voor de ingelogde student (dev only)' })
  seedActivities(@CurrentStudent() student: Student): Promise<ActivityResponseDto[]> {
    return this.activityService.seed(student.id);
  }
}
```

- [ ] **Stap 4: Draai de test — verwacht: PASS**

```bash
cd backend && npx jest dev.controller.spec.ts --no-coverage
```

Verwacht: 1 test groen.

- [ ] **Stap 5: Commit**

```bash
git add backend/src/dev/dev.controller.ts backend/src/dev/dev.controller.spec.ts
git commit -m "feat(dev): add DevController with seed/activities endpoint"
```

---

## Task 3: DevModule + conditionele registratie in AppModule

**Files:**
- Create: `backend/src/dev/dev.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Stap 1: Maak DevModule aan**

```typescript
// backend/src/dev/dev.module.ts
import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { DevController } from './dev.controller';

@Module({
  imports: [ActivityModule],
  controllers: [DevController],
})
export class DevModule {}
```

- [ ] **Stap 2: Registreer DevModule conditioneel in AppModule**

Vervang de volledige inhoud van `backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { DevModule } from './dev/dev.module';
import { DocumentModule } from './document/document.module';
import { validate } from './env.validation';
import { HealthModule } from './health/health.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    DatabaseModule,
    AuthModule,
    StudentModule,
    HealthModule,
    DocumentModule,
    ChatModule,
    ActivityModule,
    ...(process.env.NODE_ENV !== 'production' ? [DevModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Stap 3: Draai de volledige testsuite**

```bash
cd backend && npx jest --no-coverage
```

Verwacht: alle activity en dev tests groen. De pre-existing `env.validation.spec.ts` failures zijn niet door ons veroorzaakt en mogen blijven.

- [ ] **Stap 4: Commit**

```bash
git add backend/src/dev/dev.module.ts backend/src/app.module.ts
git commit -m "feat(dev): add DevModule and register conditionally in AppModule"
```

---

## Task 4: Verwijder seed uit ActivityController

**Files:**
- Modify: `backend/src/activity/activity.controller.ts`
- Modify: `backend/src/activity/activity.controller.spec.ts`

- [ ] **Stap 1: Verwijder seed methode uit ActivityController**

Vervang de volledige inhoud van `backend/src/activity/activity.controller.ts`:

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentStudent } from '../auth/decorators/current-student.decorator';
import { Student } from '../student/student.entity';
import { ActivityService } from './activity.service';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@ApiTags('activities')
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Alle activiteiten van de ingelogde student' })
  @ApiOkResponse({ type: [ActivityResponseDto] })
  findAll(@CurrentStudent() student: Student): Promise<ActivityResponseDto[]> {
    return this.activityService.findAll(student.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Één activiteit ophalen' })
  @ApiOkResponse({ type: ActivityResponseDto })
  findOne(
    @Param('id') id: string,
    @CurrentStudent() student: Student,
  ): Promise<ActivityResponseDto> {
    return this.activityService.findOne(id, student.id);
  }

  @Post()
  @ApiOperation({ summary: 'Nieuwe activiteit aanmaken' })
  @ApiOkResponse({ type: ActivityResponseDto })
  create(
    @Body() dto: CreateActivityDto,
    @CurrentStudent() student: Student,
  ): Promise<ActivityResponseDto> {
    return this.activityService.create(student.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Activiteit bijwerken' })
  @ApiOkResponse({ type: ActivityResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
    @CurrentStudent() student: Student,
  ): Promise<ActivityResponseDto> {
    return this.activityService.update(id, student.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Activiteit verwijderen' })
  remove(
    @Param('id') id: string,
    @CurrentStudent() student: Student,
  ): Promise<void> {
    return this.activityService.remove(id, student.id);
  }
}
```

- [ ] **Stap 2: Verwijder seed test uit activity.controller.spec.ts**

Vervang de volledige inhoud van `backend/src/activity/activity.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { Activity } from './activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

const STUDENT_ID = 'student-uuid';
const mockStudent = { id: STUDENT_ID } as any;

const makeActivity = (overrides: Partial<Activity> = {}): Activity =>
  ({
    id: 'act-1',
    studentId: STUDENT_ID,
    portflowId: null,
    title: 'Test',
    description: null,
    position: 0,
    type: 'opdracht',
    status: 'open',
    deadline: null,
    competencyLabel: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Activity;

describe('ActivityController', () => {
  let controller: ActivityController;
  let service: jest.Mocked<ActivityService>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<ActivityService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [{ provide: ActivityService, useValue: service }],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
  });

  it('findAll roept service.findAll aan met studentId', async () => {
    service.findAll.mockResolvedValue([makeActivity()]);
    const result = await controller.findAll(mockStudent);
    expect(service.findAll).toHaveBeenCalledWith(STUDENT_ID);
    expect(result).toHaveLength(1);
  });

  it('findOne roept service.findOne aan met id en studentId', async () => {
    service.findOne.mockResolvedValue(makeActivity());
    const result = await controller.findOne('act-1', mockStudent);
    expect(service.findOne).toHaveBeenCalledWith('act-1', STUDENT_ID);
    expect(result.id).toBe('act-1');
  });

  it('create roept service.create aan met studentId en dto', async () => {
    const dto: CreateActivityDto = { title: 'Nieuw', type: 'opdracht' };
    service.create.mockResolvedValue(makeActivity({ title: 'Nieuw' }));
    const result = await controller.create(dto, mockStudent);
    expect(service.create).toHaveBeenCalledWith(STUDENT_ID, dto);
    expect(result.title).toBe('Nieuw');
  });

  it('update roept service.update aan', async () => {
    const dto: UpdateActivityDto = { status: 'bezig' };
    service.update.mockResolvedValue(makeActivity({ status: 'bezig' }));
    const result = await controller.update('act-1', dto, mockStudent);
    expect(service.update).toHaveBeenCalledWith('act-1', STUDENT_ID, dto);
    expect(result.status).toBe('bezig');
  });

  it('remove roept service.remove aan', async () => {
    service.remove.mockResolvedValue(undefined);
    await controller.remove('act-1', mockStudent);
    expect(service.remove).toHaveBeenCalledWith('act-1', STUDENT_ID);
  });
});
```

- [ ] **Stap 3: Draai de volledige testsuite — verwacht: alles groen**

```bash
cd backend && npx jest --no-coverage
```

Verwacht: alle tests groen (behalve pre-existing `env.validation.spec.ts` failures).

- [ ] **Stap 4: Commit**

```bash
git add backend/src/activity/activity.controller.ts backend/src/activity/activity.controller.spec.ts
git commit -m "refactor(activity): remove seed endpoint, now lives in DevModule"
```
