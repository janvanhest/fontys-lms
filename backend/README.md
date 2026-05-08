# Fontys LMS Backend

NestJS backend voor het Fontys LMS-project. Deze service draait de API en publiceert Swagger-documentatie voor lokale ontwikkeling.

## Stack

- NestJS 11
- TypeScript
- pnpm
- Swagger via `@nestjs/swagger`
- Docker met aparte `development`, `build` en `production` stages

## Vereisten

- Node.js 22
- `pnpm` via Corepack of een lokale installatie

## Lokaal starten

Installeer dependencies:

```bash
pnpm install
```

Start de development server:

```bash
pnpm run start:dev
```

De backend draait standaard op `http://localhost:3000`.

## API-documentatie

Swagger is lokaal beschikbaar op:

```text
http://localhost:3000/api
```

De applicatie gebruikt `PORT` als environment variable. Als die niet gezet is, wordt poort `3000` gebruikt.

## Beschikbare scripts

```bash
pnpm run start
pnpm run start:dev
pnpm run start:debug
pnpm run start:prod
pnpm run build
pnpm run lint
pnpm run format
pnpm run test
pnpm run test:watch
pnpm run test:cov
pnpm run test:debug
pnpm run test:e2e
```

## Docker

Build de image:

```bash
docker build -t fontys-lms-backend .
```

Start de container:

```bash
docker run --rm -p 3000:3000 fontys-lms-backend
```

Voor development gebruikt de `Dockerfile` standaard:

```bash
pnpm run start:dev
```

De productiecontainer start met:

```bash
node dist/main.js
```

## Structuur

```text
src/
  app.controller.ts
  app.module.ts
  app.service.ts
  main.ts
test/
  app.e2e-spec.ts
```

## Status

De huidige codebase bevat nog vooral de basisstructuur van een NestJS-app. Naarmate domeinmodules voor het LMS worden toegevoegd, is dit de logische plek om API-routes, architectuurkeuzes en setup-instructies verder te documenteren.
