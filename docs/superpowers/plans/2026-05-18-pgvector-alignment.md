# Pgvector Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align document embedding storage and retrieval with pgvector so the database schema, seeding flow, and similarity query all use `vector(768)` instead of `real[]`.

**Architecture:** Keep the existing NestJS module structure intact and limit the change to the document persistence and retrieval path. PostgreSQL already loads the `vector` extension at startup, so this plan focuses on making the TypeORM entity and raw SQL query consistent with that database capability, then locking the behavior down with targeted tests.

**Tech Stack:** NestJS 11, TypeORM 0.3.x, PostgreSQL 16, pgvector, Jest, pnpm

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Modify | `backend/src/document/document.entity.ts` | Store embeddings as pgvector-backed column metadata instead of `real[]` |
| Modify | `backend/src/chat/document-search.service.ts` | Query documents with a pgvector-compatible cast/operator |
| Modify | `backend/src/chat/document-search.service.spec.ts` | Prove retrieval uses pgvector SQL, not `real[]` |
| Modify | `backend/src/document/document-seeder.service.spec.ts` | Keep seeder expectations aligned with the entity type contract |
| Verify | `postgres/init.sql` | Confirm `CREATE EXTENSION IF NOT EXISTS vector;` remains the DB bootstrap source |

---

### Task 1: Lock Down Retrieval Behavior First

**Files:**
- Modify: `backend/src/chat/document-search.service.spec.ts`
- Test: `backend/src/chat/document-search.service.spec.ts`

- [ ] **Step 1: Write the failing test assertion for pgvector SQL**

Replace the pgvector assertion in `backend/src/chat/document-search.service.spec.ts` so it checks for a `vector` cast and rejects the old `real[]` cast:

```typescript
  it('voert pgvector query uit en combineert content', async () => {
    mockEmbeddingService.embedText.mockResolvedValue([0.1, 0.2, 0.3]);
    mockDataSource.query.mockResolvedValue([
      { content: 'Eerste chunk.' },
      { content: 'Tweede chunk.' },
    ]);

    const result = await service.zoekRelevanteChunks('challenge beschrijving');

    expect(mockDataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY embedding <=> $1::vector'),
      ['[0.1,0.2,0.3]', 5],
    );
    expect(mockDataSource.query).not.toHaveBeenCalledWith(
      expect.stringContaining('real[]'),
      expect.anything(),
    );
    expect(result).toContain('Eerste chunk.');
    expect(result).toContain('Tweede chunk.');
  });
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run:

```bash
cd backend
pnpm test -- --runInBand src/chat/document-search.service.spec.ts
```

Expected: FAIL because the implementation still issues `ORDER BY embedding <-> $1::real[]`.

- [ ] **Step 3: Commit the failing test checkpoint**

```bash
git add backend/src/chat/document-search.service.spec.ts
git commit -m "test: capture pgvector retrieval contract"
```

---

### Task 2: Switch Retrieval Query to Pgvector

**Files:**
- Modify: `backend/src/chat/document-search.service.ts`
- Test: `backend/src/chat/document-search.service.spec.ts`

- [ ] **Step 1: Update the SQL to use pgvector typing**

Change the query in `backend/src/chat/document-search.service.ts` to:

```typescript
    const vectorLiteral = `[${embedding.join(',')}]`;
    const rows = await this.dataSource.query<DocumentRow[]>(
      `SELECT content
       FROM documents
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [vectorLiteral, topK],
    );
```

Notes:
- Use `$1::vector`, not `$1::real[]`.
- Use `<=>` for cosine distance to match the review feedback and intended retrieval semantics.
- Keep the return shape unchanged so callers do not need modification.

- [ ] **Step 2: Run the focused test to verify it passes**

Run:

```bash
cd backend
pnpm test -- --runInBand src/chat/document-search.service.spec.ts
```

Expected: PASS with all three `DocumentSearchService` tests green.

- [ ] **Step 3: Commit the retrieval fix**

```bash
git add backend/src/chat/document-search.service.ts backend/src/chat/document-search.service.spec.ts
git commit -m "fix: use pgvector cosine distance for document search"
```

---

### Task 3: Align Entity Storage Type With Pgvector

**Files:**
- Modify: `backend/src/document/document.entity.ts`
- Modify: `backend/src/document/document-seeder.service.spec.ts`
- Test: `backend/src/document/document-seeder.service.spec.ts`

- [ ] **Step 1: Write the failing entity metadata test**

Add this test near the top-level `describe('DocumentSeederService', ...)` block in `backend/src/document/document-seeder.service.spec.ts`:

```typescript
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
```

Why this test: it proves the seeder still passes raw numeric arrays into TypeORM after the entity column metadata changes, so the persistence boundary remains stable.

- [ ] **Step 2: Run the focused seeder test file**

Run:

```bash
cd backend
pnpm test -- --runInBand src/document/document-seeder.service.spec.ts
```

Expected: PASS or FAIL only if the entity/type update creates an unexpected break. If it already passes, keep it as the guardrail before the entity change.

- [ ] **Step 3: Update the entity column definition to pgvector**

Replace the embedding column in `backend/src/document/document.entity.ts` with:

```typescript
  @Column({
    type: 'vector',
    length: 768,
    nullable: true,
  })
  embedding!: number[] | null;
```

Notes:
- `type: 'vector'` is the important switch away from Postgres arrays.
- `length: 768` documents and enforces the expected embedding dimensionality.
- Keep `number[] | null` on the TypeScript side so the service contracts stay simple.

- [ ] **Step 4: Re-run the seeder tests**

Run:

```bash
cd backend
pnpm test -- --runInBand src/document/document-seeder.service.spec.ts
```

Expected: PASS with the new pgvector persistence metadata in place.

- [ ] **Step 5: Commit the entity alignment**

```bash
git add backend/src/document/document.entity.ts backend/src/document/document-seeder.service.spec.ts
git commit -m "fix: store document embeddings as pgvector"
```

---

### Task 4: Full Verification and Review Response Prep

**Files:**
- Verify: `postgres/init.sql`
- Verify: `backend/src/chat/document-search.service.ts`
- Verify: `backend/src/document/document.entity.ts`

- [ ] **Step 1: Reconfirm the extension bootstrap file**

Run:

```bash
sed -n '1,20p' postgres/init.sql
```

Expected:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

- [ ] **Step 2: Run the targeted backend test set**

Run:

```bash
cd backend
pnpm test -- --runInBand src/chat/document-search.service.spec.ts src/document/document-seeder.service.spec.ts
```

Expected: PASS for both test files.

- [ ] **Step 3: Run one broader safety check**

Run:

```bash
cd backend
pnpm test -- --runInBand src/embedding/embedding.service.spec.ts
```

Expected: PASS, confirming the embedding service contract still matches the document pipeline.

- [ ] **Step 4: Commit the final verification state**

```bash
git add backend/src/chat/document-search.service.ts \
  backend/src/chat/document-search.service.spec.ts \
  backend/src/document/document.entity.ts \
  backend/src/document/document-seeder.service.spec.ts \
  docs/superpowers/plans/2026-05-18-pgvector-alignment.md
git commit -m "docs: add pgvector alignment plan"
```

---

## Review Response Notes

Use this wording when replying to the review after implementation:

- The extension concern was already covered in `postgres/init.sql`, so the repo was not missing `CREATE EXTENSION IF NOT EXISTS vector;`.
- The reviewer was correct that the application layer still used `real[]` for the `documents.embedding` column and in the retrieval query.
- The fix is to align both persistence and query execution to `vector(768)` and pgvector distance operators now, rather than deferring it to a later PR.
