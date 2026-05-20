# Activities Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a per-student activities CRUD API in the NestJS backend, seeded with portflow-compatible mockdata, that replaces the hardcoded `initialActivities` in the frontend.

**Architecture:** Volledig lokaal beheer — activiteiten leven in PostgreSQL per student. De module volgt het bestaande NestJS-patroon (entity → service → controller → module). De `studentId` komt altijd uit de auth-context via `@CurrentStudent()`; nooit als URL-parameter voor eigen routes.

**Tech Stack:** NestJS, TypeORM, PostgreSQL, class-validator, class-transformer, Jest

---

## File map

| Actie | Pad | Verantwoordelijkheid |
|---|---|---|
| Create | `backend/src/activity/activity.entity.ts` | TypeORM entity met alle kolommen |
| Create | `backend/src/activity/dto/create-activity.dto.ts` | Validatie voor POST body |
| Create | `backend/src/activity/dto/update-activity.dto.ts` | Validatie voor PATCH body (alle velden optional) |
| Create | `backend/src/activity/dto/activity-response.dto.ts` | Response shape + Swagger |
| Create | `backend/src/activity/activity.service.ts` | CRUD + ownership check + seed |
| Create | `backend/src/activity/activity.service.spec.ts` | Unit tests service |
| Create | `backend/src/activity/activity.controller.ts` | HTTP routes |
| Create | `backend/src/activity/activity.controller.spec.ts` | Unit tests controller |
| Create | `backend/src/activity/activity.module.ts` | NestJS module |
| Create | `backend/src/database/migrations/20260520000100-create-activities-table.ts` | DB migratie |
| Modify | `backend/src/database/typeorm.config.ts` | Registreer `Activity` entity |
| Modify | `backend/src/app.module.ts` | Importeer `ActivityModule` |

---

## Task 1: Activity entity

**Files:**
- Create: `backend/src/activity/activity.entity.ts`

- [ ] **Stap 1: Maak de entity aan**

```typescript
// backend/src/activity/activity.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ActivityStatus = 'open' | 'bezig' | 'feedback' | 'afgerond';
export type ActivityType =
  | 'opdracht'
  | 'workshop'
  | 'competentie'
  | 'eigen activiteit'
  | 'challenge'
  | 'coaching'
  | 'sprint review'
  | 'semesterplan'
  | 'posterpresentatie'
  | 'overdracht';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  studentId!: string;

  @Column({ type: 'int', nullable: true })
  portflowId!: number | null;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column()
  type!: ActivityType;

  @Column({ default: 'open' })
  status!: ActivityStatus;

  @Column({ type: 'date', nullable: true })
  deadline!: string | null;

  @Column({ type: 'varchar', nullable: true })
  competencyLabel!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

- [ ] **Stap 2: Commit**

```bash
git add backend/src/activity/activity.entity.ts
git commit -m "feat(activity): add Activity entity"
```

---

## Task 2: Database migratie

**Files:**
- Create: `backend/src/database/migrations/20260520000100-create-activities-table.ts`
- Modify: `backend/src/database/typeorm.config.ts`

- [ ] **Stap 1: Schrijf de migratie**

```typescript
// backend/src/database/migrations/20260520000100-create-activities-table.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivitiesTable20260520000100 implements MigrationInterface {
  name = 'CreateActivitiesTable20260520000100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "activities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" uuid NOT NULL,
        "portflowId" integer,
        "title" character varying NOT NULL,
        "description" text,
        "position" integer NOT NULL DEFAULT 0,
        "type" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'open',
        "deadline" date,
        "competencyLabel" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activities_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_activities_studentId" ON "activities" ("studentId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activities_studentId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activities"`);
  }
}
```

- [ ] **Stap 2: Registreer de entity in typeorm.config.ts**

Open `backend/src/database/typeorm.config.ts`. Voeg `Activity` toe aan de imports en de `entities` array:

```typescript
import { join } from 'node:path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConversationEntity } from '../chat/entities/conversation.entity';
import { MessageEntity } from '../chat/entities/message.entity';
import { DocumentEntity } from '../document/document.entity';
import { Student } from '../student/student.entity';
import { Activity } from '../activity/activity.entity';

const entities = [ConversationEntity, MessageEntity, DocumentEntity, Student, Activity];
const migrations = [join(__dirname, 'migrations', '*{.ts,.js}')];

export function createTypeOrmOptions(databaseUrl: string): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    url: databaseUrl,
    entities,
    migrations,
    synchronize: false,
    migrationsRun: true,
  };
}

export function createDataSourceOptions(databaseUrl: string): DataSourceOptions {
  return createTypeOrmOptions(databaseUrl) as DataSourceOptions;
}

export default new DataSource(
  createDataSourceOptions(
    process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  ),
);
```

- [ ] **Stap 3: Commit**

```bash
git add backend/src/database/migrations/20260520000100-create-activities-table.ts
git add backend/src/database/typeorm.config.ts
git commit -m "feat(activity): add activities table migration"
```

---

## Task 3: DTOs

**Files:**
- Create: `backend/src/activity/dto/create-activity.dto.ts`
- Create: `backend/src/activity/dto/update-activity.dto.ts`
- Create: `backend/src/activity/dto/activity-response.dto.ts`

- [ ] **Stap 1: Create DTO**

```typescript
// backend/src/activity/dto/create-activity.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { ActivityStatus, ActivityType } from '../activity.entity';

const ACTIVITY_TYPES: ActivityType[] = [
  'opdracht', 'workshop', 'competentie', 'eigen activiteit', 'challenge',
  'coaching', 'sprint review', 'semesterplan', 'posterpresentatie', 'overdracht',
];
const ACTIVITY_STATUSES: ActivityStatus[] = ['open', 'bezig', 'feedback', 'afgerond'];

export class CreateActivityDto {
  @ApiProperty({ example: 'Brainstorm' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Omschrijving van de activiteit' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 7238 })
  @IsInt()
  @IsOptional()
  portflowId?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @IsOptional()
  position?: number;

  @ApiProperty({ enum: ACTIVITY_TYPES, example: 'opdracht' })
  @IsIn(ACTIVITY_TYPES)
  type!: ActivityType;

  @ApiPropertyOptional({ enum: ACTIVITY_STATUSES, example: 'open' })
  @IsIn(ACTIVITY_STATUSES)
  @IsOptional()
  status?: ActivityStatus;

  @ApiPropertyOptional({ example: '2026-03-14' })
  @IsString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ example: 'Software - Realiseren - Niveau 2' })
  @IsString()
  @IsOptional()
  competencyLabel?: string;
}
```

- [ ] **Stap 2: Update DTO**

```typescript
// backend/src/activity/dto/update-activity.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import type { ActivityStatus, ActivityType } from '../activity.entity';

const ACTIVITY_TYPES: ActivityType[] = [
  'opdracht', 'workshop', 'competentie', 'eigen activiteit', 'challenge',
  'coaching', 'sprint review', 'semesterplan', 'posterpresentatie', 'overdracht',
];
const ACTIVITY_STATUSES: ActivityStatus[] = ['open', 'bezig', 'feedback', 'afgerond'];

export class UpdateActivityDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ACTIVITY_TYPES })
  @IsIn(ACTIVITY_TYPES)
  @IsOptional()
  type?: ActivityType;

  @ApiPropertyOptional({ enum: ACTIVITY_STATUSES })
  @IsIn(ACTIVITY_STATUSES)
  @IsOptional()
  status?: ActivityStatus;

  @ApiPropertyOptional({ example: '2026-03-14' })
  @IsString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  competencyLabel?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  position?: number;
}
```

- [ ] **Stap 3: Response DTO**

```typescript
// backend/src/activity/dto/activity-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ActivityStatus, ActivityType } from '../activity.entity';

export class ActivityResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-...' })
  id!: string;

  @ApiPropertyOptional({ example: 7238 })
  portflowId!: number | null;

  @ApiProperty({ example: 'Brainstorm' })
  title!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiProperty({ example: 8 })
  position!: number;

  @ApiProperty({ example: 'opdracht' })
  type!: ActivityType;

  @ApiProperty({ example: 'open' })
  status!: ActivityStatus;

  @ApiPropertyOptional({ example: '2026-03-14' })
  deadline!: string | null;

  @ApiPropertyOptional()
  competencyLabel!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
```

- [ ] **Stap 4: Commit**

```bash
git add backend/src/activity/dto/
git commit -m "feat(activity): add activity DTOs"
```

---

## Task 4: ActivityService (TDD)

**Files:**
- Create: `backend/src/activity/activity.service.spec.ts`
- Create: `backend/src/activity/activity.service.ts`

- [ ] **Stap 1: Schrijf de falende tests**

```typescript
// backend/src/activity/activity.service.spec.ts
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

const STUDENT_A = 'student-a-uuid';
const STUDENT_B = 'student-b-uuid';

const makeActivity = (overrides: Partial<Activity> = {}): Activity =>
  ({
    id: 'act-uuid-1',
    studentId: STUDENT_A,
    portflowId: null,
    title: 'Test activiteit',
    description: null,
    position: 0,
    type: 'opdracht',
    status: 'open',
    deadline: null,
    competencyLabel: null,
    createdAt: new Date('2026-05-20'),
    updatedAt: new Date('2026-05-20'),
    ...overrides,
  }) as Activity;

describe('ActivityService', () => {
  let service: ActivityService;
  let repo: jest.Mocked<Pick<Repository<Activity>, 'find' | 'findOne' | 'create' | 'save' | 'delete'>>;

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        { provide: getRepositoryToken(Activity), useValue: repo },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  describe('findAll', () => {
    it('returns activities for the student sorted by deadline then position', async () => {
      const activities = [makeActivity({ id: 'a1' }), makeActivity({ id: 'a2' })];
      repo.find.mockResolvedValue(activities);

      const result = await service.findAll(STUDENT_A);

      expect(repo.find).toHaveBeenCalledWith({
        where: { studentId: STUDENT_A },
        order: { deadline: { direction: 'ASC', nulls: 'LAST' }, position: 'ASC' },
      });
      expect(result).toEqual(activities);
    });
  });

  describe('findOne', () => {
    it('returns the activity when it belongs to the student', async () => {
      const activity = makeActivity();
      repo.findOne.mockResolvedValue(activity);

      const result = await service.findOne('act-uuid-1', STUDENT_A);

      expect(result).toEqual(activity);
    });

    it('throws NotFoundException when activity does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing-id', STUDENT_A)).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when activity belongs to a different student', async () => {
      repo.findOne.mockResolvedValue(makeActivity({ studentId: STUDENT_B }));

      await expect(service.findOne('act-uuid-1', STUDENT_A)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and saves an activity for the student', async () => {
      const dto: CreateActivityDto = { title: 'Nieuwe activiteit', type: 'workshop' };
      const created = makeActivity({ title: 'Nieuwe activiteit', type: 'workshop' });
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      const result = await service.create(STUDENT_A, dto);

      expect(repo.create).toHaveBeenCalledWith({ ...dto, studentId: STUDENT_A, position: 0, status: 'open' });
      expect(repo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('updates and returns the activity', async () => {
      const activity = makeActivity();
      const dto: UpdateActivityDto = { status: 'bezig' };
      const updated = { ...activity, status: 'bezig' } as Activity;
      repo.findOne.mockResolvedValue(activity);
      repo.save.mockResolvedValue(updated);

      const result = await service.update('act-uuid-1', STUDENT_A, dto);

      expect(repo.save).toHaveBeenCalledWith({ ...activity, ...dto });
      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when activity does not belong to student', async () => {
      repo.findOne.mockResolvedValue(makeActivity({ studentId: STUDENT_B }));

      await expect(service.update('act-uuid-1', STUDENT_A, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the activity when it belongs to the student', async () => {
      repo.findOne.mockResolvedValue(makeActivity());

      await service.remove('act-uuid-1', STUDENT_A);

      expect(repo.delete).toHaveBeenCalledWith('act-uuid-1');
    });

    it('throws NotFoundException when activity does not belong to student', async () => {
      repo.findOne.mockResolvedValue(makeActivity({ studentId: STUDENT_B }));

      await expect(service.remove('act-uuid-1', STUDENT_A)).rejects.toThrow(NotFoundException);
    });
  });

  describe('seed', () => {
    it('verwijdert bestaande activiteiten en maakt 10 nieuwe aan', async () => {
      repo.delete.mockResolvedValue({ affected: 5, raw: [] });
      repo.create.mockImplementation((data) => data as Activity);
      repo.save.mockImplementation(async (data) => data as Activity);

      const results = await service.seed(STUDENT_A);

      expect(repo.delete).toHaveBeenCalledWith({ studentId: STUDENT_A });
      expect(results).toHaveLength(10);
    });
  });
});
```

- [ ] **Stap 2: Draai de tests — verwacht: FAIL**

```bash
cd backend && npx jest activity.service.spec.ts --no-coverage
```

Verwacht: `Cannot find module './activity.service'`

- [ ] **Stap 3: Implementeer de service**

```typescript
// backend/src/activity/activity.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

const SEED_ACTIVITIES: Omit<Activity, 'id' | 'studentId' | 'createdAt' | 'updatedAt'>[] = [
  { portflowId: 7178, title: 'Context helder krijgen', description: 'Analyseer en beschrijf de projectcontext.', position: 1, type: 'opdracht', status: 'afgerond', deadline: '2026-03-07', competencyLabel: 'Software - Analyseren - Niveau 2' },
  { portflowId: 7179, title: 'Probleem helder krijgen', description: 'Formuleer een heldere probleemstelling.', position: 2, type: 'opdracht', status: 'afgerond', deadline: '2026-03-11', competencyLabel: 'Software - Analyseren - Niveau 2' },
  { portflowId: 7193, title: 'Oorzaak en Context', description: 'Onderzoek de oorzaken achter het probleem.', position: 3, type: 'opdracht', status: 'afgerond', deadline: '2026-03-13', competencyLabel: 'Software - Analyseren - Niveau 2' },
  { portflowId: 7202, title: 'Opzetten vragenlijst', description: 'Ontwerp een vragenlijst voor stakeholders.', position: 4, type: 'opdracht', status: 'bezig', deadline: '2026-05-21', competencyLabel: 'Software - Adviseren - Niveau 2' },
  { portflowId: 7209, title: 'Stakeholderanalyse', description: 'Identificeer en analyseer alle stakeholders.', position: 5, type: 'opdracht', status: 'open', deadline: '2026-05-23', competencyLabel: 'Software - Adviseren - Niveau 2' },
  { portflowId: 7219, title: 'Domeinmodellen', description: null, position: 6, type: 'opdracht', status: 'open', deadline: '2026-05-26', competencyLabel: 'Software - Ontwerpen - Niveau 2' },
  { portflowId: 7237, title: 'Risico Tabel', description: null, position: 7, type: 'opdracht', status: 'open', deadline: '2026-05-28', competencyLabel: 'Software - Ontwerpen - Niveau 2' },
  { portflowId: 7238, title: 'Brainstorm', description: null, position: 8, type: 'workshop', status: 'open', deadline: '2026-06-04', competencyLabel: null },
  { portflowId: 7239, title: 'Scenariovergelijkingstabel', description: null, position: 9, type: 'opdracht', status: 'open', deadline: '2026-06-11', competencyLabel: 'Software - Ontwerpen - Niveau 3' },
  { portflowId: 7180, title: 'Persoonlijk ontwikkelplan', description: 'Schrijf een persoonlijk ontwikkelplan voor dit semester.', position: 10, type: 'eigen activiteit', status: 'open', deadline: '2026-06-18', competencyLabel: null },
];

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly repo: Repository<Activity>,
  ) {}

  findAll(studentId: string): Promise<Activity[]> {
    return this.repo.find({
      where: { studentId },
      order: { deadline: { direction: 'ASC', nulls: 'LAST' }, position: 'ASC' },
    });
  }

  async findOne(id: string, studentId: string): Promise<Activity> {
    const activity = await this.repo.findOne({ where: { id } });
    if (!activity || activity.studentId !== studentId) {
      throw new NotFoundException(`Activity ${id} not found`);
    }
    return activity;
  }

  create(studentId: string, dto: CreateActivityDto): Promise<Activity> {
    const activity = this.repo.create({
      ...dto,
      studentId,
      position: dto.position ?? 0,
      status: dto.status ?? 'open',
    });
    return this.repo.save(activity);
  }

  async update(id: string, studentId: string, dto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id, studentId);
    return this.repo.save({ ...activity, ...dto });
  }

  async remove(id: string, studentId: string): Promise<void> {
    await this.findOne(id, studentId);
    await this.repo.delete(id);
  }

  async seed(studentId: string): Promise<Activity[]> {
    await this.repo.delete({ studentId });
    const activities = SEED_ACTIVITIES.map((data) =>
      this.repo.create({ ...data, studentId }),
    );
    return Promise.all(activities.map((a) => this.repo.save(a)));
  }
}
```

- [ ] **Stap 4: Draai de tests — verwacht: PASS**

```bash
cd backend && npx jest activity.service.spec.ts --no-coverage
```

Verwacht: alle tests groen.

- [ ] **Stap 5: Commit**

```bash
git add backend/src/activity/activity.service.ts backend/src/activity/activity.service.spec.ts
git commit -m "feat(activity): add ActivityService with TDD"
```

---

## Task 5: ActivityController (TDD)

**Files:**
- Create: `backend/src/activity/activity.controller.spec.ts`
- Create: `backend/src/activity/activity.controller.ts`

- [ ] **Stap 1: Schrijf de falende tests**

```typescript
// backend/src/activity/activity.controller.spec.ts
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
      seed: jest.fn(),
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

  it('seed roept service.seed aan en retourneert activiteiten', async () => {
    service.seed.mockResolvedValue([makeActivity(), makeActivity({ id: 'act-2' })]);
    const result = await controller.seed(mockStudent);
    expect(service.seed).toHaveBeenCalledWith(STUDENT_ID);
    expect(result).toHaveLength(2);
  });
});
```

- [ ] **Stap 2: Draai de tests — verwacht: FAIL**

```bash
cd backend && npx jest activity.controller.spec.ts --no-coverage
```

Verwacht: `Cannot find module './activity.controller'`

- [ ] **Stap 3: Implementeer de controller**

```typescript
// backend/src/activity/activity.controller.ts
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

  @Post('seed')
  @ApiOperation({ summary: 'Mockdata laden voor de ingelogde student (demo only)' })
  @ApiOkResponse({ type: [ActivityResponseDto] })
  seed(@CurrentStudent() student: Student): Promise<ActivityResponseDto[]> {
    return this.activityService.seed(student.id);
  }
}
```

- [ ] **Stap 4: Draai de tests — verwacht: PASS**

```bash
cd backend && npx jest activity.controller.spec.ts --no-coverage
```

Verwacht: alle tests groen.

- [ ] **Stap 5: Commit**

```bash
git add backend/src/activity/activity.controller.ts backend/src/activity/activity.controller.spec.ts
git commit -m "feat(activity): add ActivityController with TDD"
```

---

## Task 6: Module + registratie in AppModule

**Files:**
- Create: `backend/src/activity/activity.module.ts`
- Modify: `backend/src/app.module.ts`

- [ ] **Stap 1: Maak de module aan**

```typescript
// backend/src/activity/activity.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Activity])],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
```

- [ ] **Stap 2: Registreer in app.module.ts**

Voeg `ActivityModule` toe aan de imports in `backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActivityModule } from './activity/activity.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
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

Verwacht: alle tests groen, geen TypeScript-fouten.

- [ ] **Stap 4: Commit**

```bash
git add backend/src/activity/activity.module.ts backend/src/app.module.ts
git commit -m "feat(activity): wire up ActivityModule in AppModule"
```

---

## Task 7: Smoke test — API handmatig verifiëren

- [ ] **Stap 1: Start de backend**

```bash
cd backend && npm run start:dev
```

Verwacht: server start op `http://localhost:3000`, geen fouten over migraties.

- [ ] **Stap 2: Seed activiteiten via Swagger of curl**

Ga naar `http://localhost:3000/api` (Swagger UI) en voer `POST /activities/seed` uit als ingelogde student.

Of via curl (vervang `<token>` met een geldig JWT):
```bash
curl -X POST http://localhost:3000/activities/seed \
  -H "Authorization: Bearer <token>"
```

Verwacht: JSON-array van 10 activiteiten.

- [ ] **Stap 3: Haal de lijst op**

```bash
curl http://localhost:3000/activities \
  -H "Authorization: Bearer <token>"
```

Verwacht: 10 activiteiten gesorteerd op deadline, met alle velden aanwezig.

- [ ] **Stap 4: Update een status**

```bash
curl -X PATCH http://localhost:3000/activities/<id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "bezig"}'
```

Verwacht: activiteit terug met `status: "bezig"`.

- [ ] **Stap 5: Commit indien alles werkt**

```bash
git add -A
git commit -m "feat(activity): activities backend complete"
```
