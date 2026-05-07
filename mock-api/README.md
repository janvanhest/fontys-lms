# Mock API

Root-level JSON Server setup for local mock data.

## Local

```bash
pnpm install
pnpm mock:api
```

The root install also installs the `mock-api` workspace package that provides `json-server`.

The API runs at `http://localhost:3002` by default.

Use `MOCK_API_PORT` to override the port temporarily:

```bash
MOCK_API_PORT=4000 pnpm mock:api
```

On Windows PowerShell:

```powershell
$env:MOCK_API_PORT="4000"
pnpm mock:api
```

Useful endpoints:

```text
GET /categories
GET /jokes
GET /jokes/:id
```

## Data Shape

`json-server` generates routes from top-level keys in `db.json`.

That means `categories` and `jokes` must stay at the root of [`db.json`](./db.json) if the frontend should keep working with:

```text
GET /categories
GET /jokes
```

Do not wrap them in a parent key like `"chuck-norris-api"`. If you do, `json-server` exposes that as a single object route instead of separate collection routes, and the frontend mock client will no longer be able to call `/categories` and `/jokes`.

Mock joke records use `categories: string[]` to match the real Chuck Norris API shape. Category filtering in mock mode happens client-side in the frontend.

## Docker

```bash
docker compose up --build
```

This starts both `mock-api` and the Vite frontend from the root [`docker-compose.yml`](../docker-compose.yml).

The compose file mounts `mock-api/db.json` read-only, so changing mock data only requires restarting the service.

For a production-style frontend container instead of the Vite dev server:

```bash
docker compose --profile prod up --build
```

To publish the mock API container on a different host port:

```bash
MOCK_API_PORT=4000 pnpm mock:docker:run
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

`VITE_CHUCK_API_BASE_URL` may include a path segment, for example `http://localhost:3002/mock-api`.
