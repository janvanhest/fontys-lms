# Mock API

Root-level JSON Server setup for local mock data.

## Local

```bash
pnpm install
pnpm mock:api
```

The API runs at `http://localhost:3002`.

Useful endpoints:

```text
GET /categories
GET /jokes
GET /jokes?category=dev
GET /jokes/:id
```

## Data Shape

`json-server` generates routes from top-level keys in `db.json`.

That means `categories` and `jokes` must stay at the root of [db.json](/Users/jhhest/school/fontys-lms/mock-api/db.json) if the frontend should keep working with:

```text
GET /categories
GET /jokes
```

Do not wrap them in a parent key like `"chuck-norris-api"`. If you do, `json-server` exposes that as a single object route instead of separate collection routes, and the frontend mock client will no longer be able to call `/categories` and `/jokes`.

## Docker

```bash
docker compose up --build
```

This starts both `mock-api` and the Vite frontend from the root [docker-compose.yml](/Users/jhhest/school/fontys-lms/docker-compose.yml).

The compose file mounts `mock-api/db.json` read-only, so changing mock data only requires restarting the service.

For a production-style frontend container instead of the Vite dev server:

```bash
docker compose --profile prod up --build
```

## Frontend

The frontend uses the real Chuck Norris API by default. To use this mock API, start the mock server and run the frontend with:

```bash
VITE_CHUCK_API_MODE=mock VITE_CHUCK_API_BASE_URL=http://localhost:3002 pnpm dev
```

On Windows PowerShell:

```powershell
$env:VITE_CHUCK_API_MODE="mock"
$env:VITE_CHUCK_API_BASE_URL="http://localhost:3002"
pnpm dev
```
