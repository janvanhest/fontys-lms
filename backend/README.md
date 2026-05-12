# Fontys LMS Backend

NestJS backend voor het Fontys LMS-project. Deze service draait de API en publiceert Swagger-documentatie voor lokale ontwikkeling.

## Stack

- NestJS 11
- TypeScript
- pnpm
- Swagger via `@nestjs/swagger`
- Globale request-validatie via `ValidationPipe`, `class-validator` en `class-transformer`
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

## Validatie-standaard

Deze backend gebruikt een globale `ValidationPipe`. Daardoor geldt DTO-validatie automatisch voor alle controllers zodra een route een class-based DTO in `@Body()`, `@Param()` of `@Query()` gebruikt.

Actieve instellingen:

- `whitelist: true` verwijdert properties die niet in het DTO staan
- `forbidNonWhitelisted: true` geeft een `400 Bad Request` bij onbekende velden
- `transform: true` zet inkomende payloads om naar DTO-instanties

Een klein voorbeeld staat op `POST /echo` met `EchoMessageDto`.

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

## Testen

Unit tests:

```bash
pnpm run test
pnpm run test:watch
pnpm run test:cov
pnpm run test:debug
pnpm test -- --verbose
```

Gebruik deze commando's voor unit tests op losse modules, controllers, services en configuratie.

`pnpm test -- --verbose` laat per test zien wat er precies is uitgevoerd.

End-to-end tests:

```bash
pnpm run test:e2e
pnpm test:e2e -- --verbose
```

Gebruik deze commando's voor end-to-end tests van complete HTTP-routes en request/response-gedrag.

Voer in de praktijk zowel de unit tests als de e2e tests uit, zodat we geen regressies missen in losse logica of in de volledige request flow.

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
