# Chat Source Attribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-answer clickable source labels for retrieval-backed chat responses, starting with Canvas content and using a source contract that future tools can reuse.

**Architecture:** Extend the backend retrieval path so course-content search returns both text and structured source metadata, collect the top 3 unique sources in the chat service, and send them in the final SSE payload. Update the frontend SSE parser, chat state, and chat rendering so assistant messages can show subtle clickable source chips only when retrieval actually happened.

**Tech Stack:** NestJS, TypeORM, pgvector, Jest, React, Vite, Vitest, MUI

---

### Task 1: Backend retrieval contract

**Files:**
- Modify: `backend/src/chat/document-search.service.ts`
- Modify: `backend/src/chat/rag.tool.ts`
- Test: `backend/src/chat/document-search.service.spec.ts`

- [ ] Write a failing backend test that expects retrieval results to include content plus source metadata.
- [ ] Run `pnpm test src/chat/document-search.service.spec.ts` in `backend/` and confirm the new expectation fails for the right reason.
- [ ] Implement a minimal typed result shape in `DocumentSearchService` and `RagTool` that returns top chunks plus `Canvas: <title>` source labels and URLs.
- [ ] Re-run `pnpm test src/chat/document-search.service.spec.ts` in `backend/` and confirm it passes.

### Task 2: Chat final payload and source aggregation

**Files:**
- Modify: `backend/src/chat/chat.service.ts`
- Test: `backend/src/chat/chat.service.spec.ts`

- [ ] Write failing backend tests for two behaviors: `final` emits JSON with `text` and `sources`, and duplicate chunk sources are deduplicated and capped at 3.
- [ ] Run `pnpm test src/chat/chat.service.spec.ts` in `backend/` and confirm both fail before implementation.
- [ ] Implement source aggregation in `ChatService`, preserve legacy status/tool events, and send `final` as JSON payload.
- [ ] Re-run `pnpm test src/chat/chat.service.spec.ts` in `backend/` and confirm it passes.

### Task 3: Frontend SSE parsing and source rendering

**Files:**
- Modify: `frontend/src/api/chat.ts`
- Modify: `frontend/src/hooks/useChatStream.ts`
- Modify: `frontend/src/tabs/chat/ChatTab.tsx`
- Create: `frontend/src/api/chat.test.ts`
- Create: `frontend/src/hooks/useChatStream.test.tsx`

- [ ] Write failing frontend tests for parsing a `final` payload with sources and for storing sources on the assistant message after streaming completes.
- [ ] Run the targeted Vitest command in `frontend/` and confirm the new tests fail before implementation.
- [ ] Implement typed source models, legacy-safe final parsing, and assistant message source storage.
- [ ] Re-run the targeted Vitest command in `frontend/` and confirm it passes.

### Task 4: UI polish for subtle clickable sources

**Files:**
- Modify: `frontend/src/tabs/chat/ChatTab.tsx`
- Modify: `frontend/src/tabs/chat/ChatTab.stories.tsx`

- [ ] Add subtle clickable source chips under assistant answers only when sources exist.
- [ ] Keep non-linked labels visually consistent but non-clickable for future no-URL cases.
- [ ] Update Storybook examples or inline preview data if needed to show the source state.

### Task 5: Verification

**Files:**
- Verify only

- [ ] Run `pnpm test src/chat/document-search.service.spec.ts src/chat/chat.service.spec.ts` in `backend/`.
- [ ] Run the targeted frontend Vitest command in `frontend/`.
- [ ] Run `pnpm build` in `frontend/` and `pnpm build` in `backend/` if the targeted tests pass.
- [ ] Report the exact commands and outcomes, plus any remaining gaps.
