# Storybook Container Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Storybook to the existing Docker Compose development stack as a separate service without changing the current frontend app service behavior.

**Architecture:** Reuse the existing `frontend` development image in `compose.override.yaml` and add a dedicated `storybook` service with its own port and command. Keep the app service on `5173`, expose Storybook on `6006`, and update documentation so the containerized workflow is the default developer path.

**Tech Stack:** Docker Compose, Node 22 Alpine, pnpm 10, Vite, Storybook 10

---

## File Structure

- Modify: `compose.override.yaml`
  Purpose: define the new `storybook` development service alongside the existing frontend service.
- Modify: `frontend/package.json`
  Purpose: optionally make the Storybook script container-friendly by binding to `0.0.0.0`.
- Modify: `frontend/README.md`
  Purpose: document Storybook as part of the Docker-based development workflow.
- Modify: `README.md`
  Purpose: mention Storybook in the root development workflow and exposed ports.

### Task 1: Add the Storybook Compose service

**Files:**
- Modify: `compose.override.yaml`

- [ ] **Step 1: Inspect the current frontend dev service and identify the reusable fields**

Review the existing `frontend` service in `compose.override.yaml` and reuse these settings for Storybook:

```yaml
build:
  context: ./frontend
  target: development
volumes:
  - frontend-node-modules:/app/node_modules
  - frontend-pnpm-store:/pnpm/store
```

- [ ] **Step 2: Add the new `storybook` service definition**

Insert a sibling service with its own port and command:

```yaml
  storybook:
    build:
      context: ./frontend
      target: development
    command: ["pnpm", "storybook", "--", "--host", "0.0.0.0", "-p", "6006"]
    ports:
      - "6006:6006"
    volumes:
      - frontend-node-modules:/app/node_modules
      - frontend-pnpm-store:/pnpm/store
    develop:
      watch:
        - action: sync
          path: ./frontend/src
          target: /app/src
        - action: rebuild
          path: ./frontend/package.json
        - action: rebuild
          path: ./frontend/pnpm-lock.yaml
    depends_on:
      - mock-api
```

- [ ] **Step 3: Validate merged Compose configuration**

Run:

```bash
docker compose config
```

Expected: exit code `0` and a rendered `storybook` service in the merged configuration output.

### Task 2: Make the Storybook script container-friendly

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Update the Storybook npm script**

Replace the current script:

```json
"storybook": "storybook dev -p 6006"
```

with:

```json
"storybook": "storybook dev --host 0.0.0.0 -p 6006"
```

- [ ] **Step 2: Verify the command still matches the service intent**

Confirm that the compose service can now use the package script directly and that local developers can also reach the same host binding behavior when needed.

No extra code is required beyond the script update.

### Task 3: Update frontend developer documentation

**Files:**
- Modify: `frontend/README.md`

- [ ] **Step 1: Replace the local-only Storybook instructions**

Update the current section that says Storybook should be started in a separate local terminal. Replace it with a Docker-first workflow like:

```md
## Storybook

Storybook draait mee in de development stack via Docker Compose.

```bash
docker compose up --watch
```

Dat start:

- de Vite dev server op `http://localhost:5173`
- Storybook op `http://localhost:6006`
- de mock API op `http://localhost:3002`
```

- [ ] **Step 2: Keep a local fallback command for non-Docker use**

Retain a short fallback note such as:

```md
Als je Storybook toch lokaal wilt draaien binnen `frontend/`:

```bash
pnpm storybook
```
```

### Task 4: Update root developer documentation

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Extend the development stack description**

Update the `make dev` / `docker compose up --watch` explanation so it explicitly includes Storybook:

```md
- de frontend dev server op `http://localhost:5173`
- Storybook op `http://localhost:6006`
- de mock API op `http://localhost:3002`
```

- [ ] **Step 2: Keep the explanation aligned with the split Compose setup**

Make sure the root README still correctly describes:

```md
- `compose.yaml` — gedeelde services
- `compose.override.yaml` — dev-configuratie
- `compose.prod.yaml` — prod-configuratie
```

No structural README rewrite is needed beyond the added Storybook mention.

### Task 5: Verify the behavior end-to-end

**Files:**
- Verify: `compose.override.yaml`
- Verify: `frontend/package.json`
- Verify: `frontend/README.md`
- Verify: `README.md`

- [ ] **Step 1: Re-run merged Compose validation**

Run:

```bash
docker compose config
```

Expected: exit code `0`.

- [ ] **Step 2: Start only the Storybook service for a focused check**

Run:

```bash
docker compose up --build -d storybook
```

Expected: the `storybook` container starts successfully without changing the existing frontend service.

- [ ] **Step 3: Check container status**

Run:

```bash
docker compose ps storybook
```

Expected: the service is listed as running and port `6006` is published.

- [ ] **Step 4: Stop the temporary verification container**

Run:

```bash
docker compose stop storybook
```

Expected: clean stop with no unrelated service changes.
