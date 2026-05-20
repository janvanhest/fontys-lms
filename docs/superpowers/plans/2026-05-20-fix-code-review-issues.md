# Fix Code Review Issues — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all Critical and Important issues found in the post-review of the `feat/implement-backend-activities` branch, plus two quick minor wins.

**Architecture:** Targeted, minimal fixes — no refactors beyond what's needed. Each task is independent and can be merged as a unit. TDD where tests are involved (fix the test first or fix the failing test then implement).

**Tech Stack:** NestJS, TypeORM, class-validator, class-transformer, Jest

---

## File Map

| File | Change |
|---|---|
| `backend/src/env.validation.ts` | Add defaults in `validate()` |
| `backend/src/env.validation.spec.ts` | Already covers defaults — tests will pass after fix |
| `backend/src/chat/conversation.service.ts` | Add `studentId` filter to `findConversationWithMessages` |
| `backend/src/chat/chat.controller.ts` | Inject `@CurrentStudent()` into `getConversation` |
| `backend/src/chat/chat.controller.spec.ts` | Add `getConversation` ownership tests |
| `backend/src/activity/activity.controller.spec.ts` | Add `studentId`-absent assertions per endpoint |
| `backend/src/activity/activity.service.ts` | Add production guard in `seed()`; batch save |
| `backend/src/document/document-seeder.service.ts` | Hash-based skip-if-unchanged |
| `backend/src/activity/activity.constants.ts` | New: shared enum arrays |
| `backend/src/activity/dto/create-activity.dto.ts` | Import from constants |
| `backend/src/activity/dto/update-activity.dto.ts` | Import from constants |

---

### Task 1: Add defaults to `env.validation.ts`

Five tests in `env.validation.spec.ts` fail because `validate()` doesn't apply defaults when `NODE_ENV`, `PORT`, `CORS_ORIGINS`, or `MOCK_AUTH` are absent.

**Files:**
- Modify: `backend/src/env.validation.ts`

- [ ] **Step 1: Run the failing tests to confirm they fail**

```bash
cd backend && npx jest src/env.validation.spec.ts --no-coverage 2>&1 | tail -20
```

Expected: 5 failures, all about missing/undefined fields.

- [ ] **Step 2: Apply defaults in `validate()`**

In `backend/src/env.validation.ts`, replace the `validate` function body so it applies defaults **before** `plainToInstance`:

```ts
export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const withDefaults: Record<string, unknown> = {
    NODE_ENV: 'development',
    PORT: 3000,
    CORS_ORIGINS: 'http://localhost:5173',
    MOCK_AUTH: true,
    ...config,
  };

  const normalizedPort = normalizePort(withDefaults.PORT);
  const normalizedMockAuth = normalizeBoolean(withDefaults.MOCK_AUTH);
  const normalizedConfig = {
    ...withDefaults,
    ...(withDefaults.PORT !== undefined ? { PORT: normalizedPort } : {}),
    ...(withDefaults.MOCK_AUTH !== undefined ? { MOCK_AUTH: normalizedMockAuth } : {}),
  };
  const validatedConfig = plainToInstance(EnvironmentVariables, normalizedConfig);
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${JSON.stringify(formatValidationErrors(errors), null, 2)}`,
    );
  }

  return validatedConfig;
}
```

- [ ] **Step 3: Run the tests to confirm they pass**

```bash
cd backend && npx jest src/env.validation.spec.ts --no-coverage 2>&1 | tail -10
```

Expected: all tests pass, 0 failures.

- [ ] **Step 4: Commit**

```bash
git add backend/src/env.validation.ts
git commit -m "fix(env): apply defaults for NODE_ENV, PORT, CORS_ORIGINS, MOCK_AUTH"
```

---

### Task 2: Fix IDOR on `GET /chat/conversations/:id`

`ConversationService.findConversationWithMessages` queries by `id` alone — any authenticated student can read any other student's conversation. Fix by adding `studentId` to the query. The controller must supply it.

**Files:**
- Modify: `backend/src/chat/conversation.service.ts`
- Modify: `backend/src/chat/chat.controller.ts`
- Modify: `backend/src/chat/chat.controller.spec.ts`

- [ ] **Step 1: Write the failing test first**

Add the following test to `backend/src/chat/chat.controller.spec.ts`, inside the existing `describe('ChatController', ...)` block, right after the `updateConversationTitle` test:

```ts
it('getConversation passes the current student id to the conversation service', async () => {
  const findConversationWithMessages = jest.fn().mockResolvedValue({
    id: 'conv-1',
    studentId: 'student-1',
    messages: [],
  });
  const module2: TestingModule = await Test.createTestingModule({
    controllers: [ChatController],
    providers: [
      { provide: ChatService, useValue: { async *streamResponse() {} } },
      {
        provide: ConversationService,
        useValue: { findConversationWithMessages, updateConversationTitle: jest.fn() },
      },
    ],
  }).compile();
  const ctrl = module2.get<ChatController>(ChatController);
  const student = { id: 'student-1' } as Student;

  await ctrl.getConversation('conv-1', student);

  expect(findConversationWithMessages).toHaveBeenCalledWith('conv-1', 'student-1');
});
```

You also need `TestingModule` to be imported — check that it's already in the imports at the top of the spec file (it should be, since it's used by `beforeEach`).

- [ ] **Step 2: Run the test to confirm it fails**

```bash
cd backend && npx jest src/chat/chat.controller.spec.ts --no-coverage 2>&1 | tail -20
```

Expected: 1 failure — `findConversationWithMessages` called with 1 argument, not 2.

- [ ] **Step 3: Add `studentId` parameter to `findConversationWithMessages` in the service**

In `backend/src/chat/conversation.service.ts`, change `findConversationWithMessages` from:

```ts
async findConversationWithMessages(conversationId: string): Promise<ConversationEntity | null> {
  return this.conversationRepository.findOne({
    where: { id: conversationId },
    relations: ['messages'],
    order: { messages: { timestamp: 'ASC' } },
  });
}
```

to:

```ts
async findConversationWithMessages(
  conversationId: string,
  studentId: string,
): Promise<ConversationEntity | null> {
  return this.conversationRepository.findOne({
    where: { id: conversationId, studentId },
    relations: ['messages'],
    order: { messages: { timestamp: 'ASC' } },
  });
}
```

- [ ] **Step 4: Update the controller to pass `studentId`**

In `backend/src/chat/chat.controller.ts`, change `getConversation` from:

```ts
@Get('conversations/:id')
@ApiOperation({ summary: 'Conversation with messages by ID (FR-08)' })
async getConversation(@Param('id') id: string) {
  return this.conversationService.findConversationWithMessages(id);
}
```

to:

```ts
@Get('conversations/:id')
@ApiOperation({ summary: 'Conversation with messages by ID (FR-08)' })
async getConversation(
  @Param('id') id: string,
  @CurrentStudent() student: Student,
) {
  return this.conversationService.findConversationWithMessages(id, student.id);
}
```

- [ ] **Step 5: Run the tests to confirm they pass**

```bash
cd backend && npx jest src/chat/chat.controller.spec.ts src/chat/chat.service.spec.ts --no-coverage 2>&1 | tail -10
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add backend/src/chat/conversation.service.ts backend/src/chat/chat.controller.ts backend/src/chat/chat.controller.spec.ts
git commit -m "fix(chat): scope GET conversation/:id to the current student (IDOR)"
```

---

### Task 3: Assert `studentId` is absent from activity controller responses

The controller strips `studentId` via `toDto`, but the existing tests never assert this. The strip is the security-relevant behavior; it must be tested.

**Files:**
- Modify: `backend/src/activity/activity.controller.spec.ts`

- [ ] **Step 1: Add `studentId`-absent assertions to each test**

In `backend/src/activity/activity.controller.spec.ts`, update each test as follows. The `makeActivity()` helper already sets `studentId: STUDENT_ID`, so checking the result doesn't have it verifies `toDto` ran.

Replace the `findAll` test:

```ts
it('findAll roept service.findAll aan met studentId', async () => {
  service.findAll.mockResolvedValue([makeActivity()]);
  const result = await controller.findAll(mockStudent);
  expect(service.findAll).toHaveBeenCalledWith(STUDENT_ID);
  expect(result).toHaveLength(1);
  expect((result[0] as any).studentId).toBeUndefined();
});
```

Replace the `findOne` test:

```ts
it('findOne roept service.findOne aan met id en studentId', async () => {
  service.findOne.mockResolvedValue(makeActivity());
  const result = await controller.findOne('act-1', mockStudent);
  expect(service.findOne).toHaveBeenCalledWith('act-1', STUDENT_ID);
  expect(result.id).toBe('act-1');
  expect((result as any).studentId).toBeUndefined();
});
```

Replace the `create` test:

```ts
it('create roept service.create aan met studentId en dto', async () => {
  const dto: CreateActivityDto = { title: 'Nieuw', type: 'opdracht' };
  service.create.mockResolvedValue(makeActivity({ title: 'Nieuw' }));
  const result = await controller.create(dto, mockStudent);
  expect(service.create).toHaveBeenCalledWith(STUDENT_ID, dto);
  expect(result.title).toBe('Nieuw');
  expect((result as any).studentId).toBeUndefined();
});
```

Replace the `update` test:

```ts
it('update roept service.update aan', async () => {
  const dto: UpdateActivityDto = { status: 'bezig' };
  service.update.mockResolvedValue(makeActivity({ status: 'bezig' }));
  const result = await controller.update('act-1', dto, mockStudent);
  expect(service.update).toHaveBeenCalledWith('act-1', STUDENT_ID, dto);
  expect(result.status).toBe('bezig');
  expect((result as any).studentId).toBeUndefined();
});
```

- [ ] **Step 2: Run the tests to confirm they pass**

```bash
cd backend && npx jest src/activity/activity.controller.spec.ts --no-coverage 2>&1 | tail -10
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add backend/src/activity/activity.controller.spec.ts
git commit -m "test(activity): assert studentId is absent from controller responses"
```

---

### Task 4: Add production guard to `ActivityService.seed()`

`seed()` deletes all of a student's activities and re-inserts hardcoded data. The `DevController` is already excluded from the production module, but `ActivityService.seed()` has no guard of its own. A future admin route mistake would wipe production data silently.

**Files:**
- Modify: `backend/src/activity/activity.service.ts`

- [ ] **Step 1: Add a production guard at the top of `seed()`**

In `backend/src/activity/activity.service.ts`, replace:

```ts
async seed(studentId: string): Promise<Activity[]> {
  await this.repo.delete({ studentId });
```

with:

```ts
async seed(studentId: string): Promise<Activity[]> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ActivityService.seed() is not allowed in production');
  }
  await this.repo.delete({ studentId });
```

- [ ] **Step 2: While here, batch the save (minor fix from review)**

In the same method, replace:

```ts
const activities = SEED_ACTIVITIES.map((data) => this.repo.create({ ...data, studentId }));
return Promise.all(activities.map((a) => this.repo.save(a)));
```

with:

```ts
const activities = SEED_ACTIVITIES.map((data) => this.repo.create({ ...data, studentId }));
return this.repo.save(activities);
```

- [ ] **Step 3: Run the activity service spec to confirm nothing broke**

```bash
cd backend && npx jest src/activity/activity.service.spec.ts --no-coverage 2>&1 | tail -10
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add backend/src/activity/activity.service.ts
git commit -m "fix(activity): guard seed() against production, batch save"
```

---

### Task 5: Skip document re-seeding when canvas content hasn't changed

`DocumentSeederService.onApplicationBootstrap` always deletes and re-seeds documents. On each boot the table is wiped and all embeddings are recomputed. Fix: compute a SHA-256 hash of all `.md` file contents in `canvas_content` and skip seeding if it matches the hash from the previous boot (stored in `canvas_content/.seed-hash`).

**Files:**
- Modify: `backend/src/document/document-seeder.service.ts`

- [ ] **Step 1: Add the hash-check helper and update `seed()`**

At the top of `backend/src/document/document-seeder.service.ts`, add the `crypto` import alongside the existing `fs` and `path` imports:

```ts
import * as crypto from 'crypto';
```

Then, in the `seed()` method, replace everything from the `mdFiles` line onwards (after `const mdFiles = allFiles.filter(...)`) with:

```ts
const mdFiles = allFiles.filter((f) => f.endsWith('.md'));

// Compute a hash of all file contents to detect changes.
const fileContents = await Promise.all(
  mdFiles.sort().map((f) => fs.readFile(path.join(contentDir, f), 'utf-8')),
);
const currentHash = crypto
  .createHash('sha256')
  .update(fileContents.join('\0'))
  .digest('hex');

const hashFile = path.join(contentDir, '.seed-hash');
let previousHash = '';
try {
  previousHash = (await fs.readFile(hashFile, 'utf-8')).trim();
} catch {
  // No hash file yet — first boot.
}

if (currentHash === previousHash) {
  this.logger.log('canvas_content unchanged, skipping document re-seeding');
  return;
}

await this.documentRepository.createQueryBuilder().delete().execute();
this.logger.log(`Cleared documents table. Seeding ${mdFiles.length} files from ${contentDir}`);

for (const file of mdFiles) {
  const raw = await fs.readFile(path.join(contentDir, file), 'utf-8');
  const { frontmatter, body } = parseFrontmatter(raw);

  const hasSource = frontmatter.source.trim().length > 0;
  const hasTitle = frontmatter.title.trim().length > 0;
  const hasUrl = frontmatter.url.trim().length > 0;

  if (!hasSource || !hasTitle || !hasUrl) {
    this.logger.warn(
      `Skipping "${file}" due to missing frontmatter — ` +
        `source: "${frontmatter.source}", title: "${frontmatter.title}", url: "${frontmatter.url}"`,
    );
    continue;
  }

  const chunks = chunkByH2(body, frontmatter.title);
  this.logger.log(`${file}: ${chunks.length} chunk(s)`);

  const entities: Partial<DocumentEntity>[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const { title, content } = chunks[i];
    const embedding = await this.embeddingService.embedText(content);

    if (embedding === null) {
      this.logger.warn(
        `${file} chunk ${i} ("${title}"): embedding failed, saving without vector`,
      );
    }

    entities.push({
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

  await this.documentRepository.save(entities);
}

await fs.writeFile(hashFile, currentHash, 'utf-8');
this.logger.log('Seeding complete');
```

- [ ] **Step 2: Run the document seeder spec to confirm nothing broke**

```bash
cd backend && npx jest src/document/document-seeder.service.spec.ts --no-coverage 2>&1 | tail -15
```

Expected: all tests pass. If any test relied on the delete always being called, update the mock/assertion to match the new hash-check flow.

- [ ] **Step 3: Add `.seed-hash` to `.gitignore` if not already there**

```bash
grep -q '.seed-hash' /Users/jhhest/school/fontys-lms/.gitignore || echo '\ncanvas_content/.seed-hash' >> /Users/jhhest/school/fontys-lms/.gitignore
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/document/document-seeder.service.ts .gitignore
git commit -m "fix(document): skip re-seeding when canvas_content is unchanged"
```

---

### Task 6: Extract shared activity enum constants

`ACTIVITY_TYPES` and `ACTIVITY_STATUSES` are copy-pasted in both `create-activity.dto.ts` and `update-activity.dto.ts`. A new type added in one place must be added in the other, or it silently diverges. Extract them to a shared file.

**Files:**
- Create: `backend/src/activity/activity.constants.ts`
- Modify: `backend/src/activity/dto/create-activity.dto.ts`
- Modify: `backend/src/activity/dto/update-activity.dto.ts`

- [ ] **Step 1: Create `activity.constants.ts`**

Create `backend/src/activity/activity.constants.ts` with:

```ts
import type { ActivityStatus, ActivityType } from './activity.entity';

export const ACTIVITY_TYPES: ActivityType[] = [
  'opdracht',
  'workshop',
  'competentie',
  'eigen activiteit',
  'challenge',
  'coaching',
  'sprint review',
  'semesterplan',
  'posterpresentatie',
  'overdracht',
];

export const ACTIVITY_STATUSES: ActivityStatus[] = ['open', 'bezig', 'feedback', 'afgerond'];
```

- [ ] **Step 2: Update `create-activity.dto.ts`**

In `backend/src/activity/dto/create-activity.dto.ts`, remove the two local constant declarations:

```ts
const ACTIVITY_TYPES: ActivityType[] = [
  'opdracht',
  'workshop',
  'competentie',
  'eigen activiteit',
  'challenge',
  'coaching',
  'sprint review',
  'semesterplan',
  'posterpresentatie',
  'overdracht',
];
const ACTIVITY_STATUSES: ActivityStatus[] = ['open', 'bezig', 'feedback', 'afgerond'];
```

And replace the import line `import type { ActivityStatus, ActivityType } from '../activity.entity';` with:

```ts
import { ACTIVITY_STATUSES, ACTIVITY_TYPES } from '../activity.constants';
import type { ActivityStatus, ActivityType } from '../activity.entity';
```

- [ ] **Step 3: Update `update-activity.dto.ts`**

Apply the identical change in `backend/src/activity/dto/update-activity.dto.ts` — remove the local declarations and add the import from `../activity.constants`.

- [ ] **Step 4: Run tests to confirm nothing broke**

```bash
cd backend && npx jest src/activity/ --no-coverage 2>&1 | tail -10
```

Expected: all activity tests pass.

- [ ] **Step 5: Commit**

```bash
git add backend/src/activity/activity.constants.ts backend/src/activity/dto/create-activity.dto.ts backend/src/activity/dto/update-activity.dto.ts
git commit -m "refactor(activity): extract ACTIVITY_TYPES and ACTIVITY_STATUSES to shared constants"
```

---

## Self-Review

**Spec coverage check:**

| Review issue | Covered by task |
|---|---|
| Critical: 5 failing env.validation tests | Task 1 |
| Important: IDOR on GET /chat/conversations/:id | Task 2 |
| Important: Controller spec doesn't assert studentId absent | Task 3 |
| Important: ActivityService.seed() unguarded in production | Task 4 |
| Important: DocumentSeeder truncates on every boot | Task 5 |
| Minor: ACTIVITY_TYPES/ACTIVITY_STATUSES duplicated | Task 6 |
| Minor: ActivityService.seed() N round-trips | Task 4 (batched) |

**Placeholder scan:** No TBDs, no vague instructions — all steps contain complete code.

**Type consistency:** `ConversationEntity`, `Student`, `Activity`, `ActivityType`, `ActivityStatus` — all used consistently with how they're defined in the entity files. `findConversationWithMessages(id, studentId)` signature updated in both service and controller in the same task.
