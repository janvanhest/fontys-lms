# Conversation Titles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace date-only conversation labels with persistent auto-generated titles and inline sidebar renaming.

**Architecture:** Extend the conversation entity with title state, let the chat service assign a first title and at most one later refinement, and add a guarded conversation title update endpoint. Update the sidebar so it renders stored titles by default and supports inline editing with optimistic save and fallback to the old value on failure.

**Tech Stack:** NestJS, TypeORM, Jest, React, Vite, Vitest, MUI

---

### Task 1: Conversation title persistence

**Files:**
- Modify: `backend/src/chat/conversation.entity.ts`
- Modify: `backend/src/chat/conversation.service.ts`
- Test: `backend/src/chat/conversation.service.spec.ts`

- [ ] Write failing tests for creating conversations with empty title state and for updating a title while marking it as manually edited.
- [ ] Run `pnpm test src/chat/conversation.service.spec.ts` in `backend/` and confirm the new expectations fail.
- [ ] Implement persistent title fields and a service method for manual title updates.
- [ ] Re-run `pnpm test src/chat/conversation.service.spec.ts` in `backend/` and confirm it passes.

### Task 2: Automatic title generation in chat flow

**Files:**
- Modify: `backend/src/chat/chat.service.ts`
- Test: `backend/src/chat/chat.service.spec.ts`

- [ ] Write failing tests for initial title generation after the first assistant answer and for a single later title refinement that stops after manual edit or max revision count.
- [ ] Run `pnpm test src/chat/chat.service.spec.ts` in `backend/` and confirm the title tests fail before implementation.
- [ ] Implement a pragmatic title generator plus title update hooks in `ChatService`.
- [ ] Re-run `pnpm test src/chat/chat.service.spec.ts` in `backend/` and confirm it passes.

### Task 3: Title update endpoint

**Files:**
- Create: `backend/src/chat/dto/update-conversation-title.dto.ts`
- Modify: `backend/src/chat/chat.controller.ts`
- Test: `backend/src/chat/chat.controller.spec.ts`

- [ ] Write failing controller tests for `PATCH /chat/conversations/:id` style behavior with student scoping.
- [ ] Run `pnpm test src/chat/chat.controller.spec.ts` in `backend/` and confirm the new test fails before implementation.
- [ ] Implement the DTO and controller method that delegates manual renaming to the conversation service with the current student id.
- [ ] Re-run `pnpm test src/chat/chat.controller.spec.ts` in `backend/` and confirm it passes.

### Task 4: Sidebar inline rename UX

**Files:**
- Modify: `frontend/src/api/chat.ts`
- Modify: `frontend/src/layouts/Sidebar.tsx`
- Modify: `frontend/src/layouts/Sidebar.stories.tsx`
- Create: `frontend/src/layouts/sidebarTitle.ts`
- Create: `frontend/src/layouts/sidebarTitle.test.ts`
- Modify: `frontend/vitest.unit.config.ts`

- [ ] Write failing frontend unit tests for title fallback and edit normalization helpers.
- [ ] Run `pnpm exec vitest run -c vitest.unit.config.ts src/layouts/sidebarTitle.test.ts` in `frontend/` and confirm they fail before implementation.
- [ ] Implement the API call for renaming, inline sidebar editing, and helper logic for title fallback plus trimming.
- [ ] Re-run `pnpm exec vitest run -c vitest.unit.config.ts src/layouts/sidebarTitle.test.ts` in `frontend/` and confirm it passes.

### Task 5: Verification

**Files:**
- Verify only

- [ ] Run `pnpm test src/chat/conversation.service.spec.ts src/chat/chat.service.spec.ts src/chat/chat.controller.spec.ts` in `backend/`.
- [ ] Run `pnpm exec vitest run -c vitest.unit.config.ts src/api/chat.test.ts src/layouts/sidebarTitle.test.ts` in `frontend/`.
- [ ] Run `pnpm build` in `backend/`.
- [ ] Run `pnpm build` in `frontend/`.
- [ ] Report commands, outcomes, and any remaining gaps such as optional future title persistence polish.
