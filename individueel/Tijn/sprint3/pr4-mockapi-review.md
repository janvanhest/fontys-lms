# PR #4 review - Mock API + Docker setup

**Auteur:** Tijn Knapen
**Datum:** mei 2026
**Branch:** `feature/docker-json-server-ii`
**PR:** https://github.com/janvanhest/fontys-lms/pull/4
**Focus van deze review:** infrastructure-kant (Docker, compose, workspace), niet de Chuck Norris frontend-code

## Samenvatting

PR voegt een mock REST API (json-server) toe als losse service in de root, plus een werkende `docker-compose.yml` die zowel de Vite frontend als de mock API tegelijk start. De root wordt in deze PR een **pnpm workspace**, met `frontend/` en `mock-api/` als submappen. Dit is de eerste echte multi-service Docker setup in de repo en zet het patroon waar mijn NestJS backend straks bij moet aansluiten.

## Wat is gewijzigd

```
docker-compose.yml                       (nieuw, 46 regels)
package.json                             (nieuw, root pnpm workspace)
pnpm-workspace.yaml                      (nieuw)
pnpm-lock.yaml                           (nieuw, 408 regels)
frontend/Dockerfile                      (nieuw, multi-stage)
frontend/.dockerignore                   (nieuw)
frontend/README.md                       (uitgebreid)
frontend/src/api/chuckNorris.ts          (mock-mode toegevoegd)
frontend/src/pages/StorybookDemoPage.tsx (info-tekstje)
mock-api/Dockerfile                      (nieuw)
mock-api/package.json                    (nieuw, json-server@1.0.0-beta.15)
mock-api/db.json                         (mock-data)
mock-api/README.md                       (nieuw, 90 regels)
```

## Wat werkt en waarom dit een goeie basis is

**1. Multi-service patroon klopt.** Root compose, services in submappen met eigen `Dockerfile`. Dit is precies wat we afgesproken hadden. Mijn `backend/` en `postgres/` haken hier zonder structurele wijziging op aan.

**2. Multi-stage Dockerfile voor de frontend.** `base` -> `deps` -> `development` / `build` -> `production`. De `target: development` wordt gebruikt voor de Vite dev server, `target: production` voor een statische `serve` op poort 4173 via een aparte profile. Dat is een mooie scheiding tussen dev- en prod-lifecycle in dezelfde Dockerfile, en is iets wat ik voor mijn NestJS-image kan kopieren.

**3. Compose volumes voor hot reload.** Frontend mount `./frontend:/app` met named volumes voor `node_modules` en de pnpm store eroverheen. Daardoor blijven container-deps en host-deps gescheiden, en HMR werkt zonder ruzie tussen Windows en Linux node_modules.

**4. Read-only mount op `db.json`.** `./mock-api/db.json:/app/db.json:ro` voorkomt dat de container de mockdata schrijft. Klein detail maar correct.

**5. Profile voor production-build.** `frontend-prod` zit achter `profiles: [prod]` zodat hij niet meedraait in de standaard `docker compose up`. Goeie aanpak voor optionele services.

**6. Configurable port via env.** `${MOCK_API_PORT:-3002}` in scripts. Nette default zonder hardcoding.

**7. READMEs per service.** Zowel `frontend/README.md` als `mock-api/README.md`. Documentatie waar het hoort. Ook handig voor mij: de "Veelvoorkomende setup problemen" uit mijn PR #3 review zit nu in de frontend README, top.

## Aandachtspunten

**1. Inconsistente build context tussen services.**

Frontend gebruikt `context: ./frontend`, mock-api gebruikt `context: .` met `dockerfile: ./mock-api/Dockerfile`. Werkt allebei, maar is asymmetrisch. Frontend Dockerfile doet `COPY package.json` en de mock-api Dockerfile doet `COPY mock-api/package.json`.

Voorstel: maak ze symmetrisch door mock-api ook `context: ./mock-api` te geven en de Dockerfile vereenvoudigen tot `COPY package.json /app/`. Dat is consistent en het maakt het patroon voor toekomstige services duidelijker (`backend/`, `postgres/` volgen dan dezelfde stijl).

**2. Workspace bevat alleen mock-api, frontend blijft buiten (observatie, geen comment).**

`pnpm-workspace.yaml` bevat alleen `mock-api`. Dat past bij de scope van deze PR: Jan voegt de mock-api toe als nieuwe service, de frontend bestond al uit PR #3 en blijft staan met z'n eigen `package.json` en setup. De frontend-wijzigingen in deze PR (`chuckNorris.ts`, `StorybookDemoPage.tsx`) zijn alleen de mock-mode-integratie, geen reorganisatie.

Voor mij iets om over na te denken voor iteratie 3: zet ik `backend/` in de workspace, of laat ik het ook buiten zoals frontend? Geen actie voor deze PR.

**3. Geen healthcheck op mock-api.**

`frontend depends_on: mock-api` zorgt alleen dat mock-api gestart wordt, niet dat hij klaar is om verzoeken te beantwoorden. Voor dev OK, maar als ik straks Postgres + NestJS toevoeg wil ik wel `depends_on: condition: service_healthy` om opstart-races te voorkomen.

Niet blocker voor deze PR, wel iets om in de gaten te houden voor mijn eigen toevoegingen.

**4. Geen `.dockerignore` in `mock-api/`.**

Frontend heeft er een, mock-api niet. In dit geval niet kritiek omdat de map klein is, maar consistency-wise zou een minimale `.dockerignore` (`node_modules`, `.git`) ook hier passen.

**5. Klein dataconsistentie-puntje in `db.json` (niet als comment geplaatst).**

`mock-general-1` heeft `category: "general"` (string) terwijl de README zegt: "Mock joke records use `categories: string[]`". De andere jokes hebben wel `categories: ["dev"]` etc.

Bewust geen review-comment van gemaakt: het is mock-data om de skeleton mee te kunnen testen, geen productiedata. Een afwijkende categorie op één joke heeft geen impact op het bewijs dat deze PR levert (compose werkt, frontend praat met mock-api). Niet de moeite waard om Jan ervoor terug te sturen.

**6. Productie-frontend gebruikt `localhost:3002` als API-URL.**

In `frontend-prod` staat `VITE_CHUCK_API_BASE_URL: http://localhost:3002`. Dat klopt zolang de frontend in de browser op de host draait, want Vite bakt de URL in de bundel en die bundel runt op de host. Maar het is wel iets om over na te denken zodra er een backend bij komt: de frontend-bundel praat tegen de host, maar de NestJS backend in een container praat tegen `postgres:5432` (servicenaam). Twee verschillende addressing-werelden. Geen bug in deze PR, wel iets dat ik moet documenteren in mijn diagrammen.

## Reviewbeslissing

**Approve met één comment** (geplaatst op GitHub).

Comment op GitHub:

1. Build context voor mock-api consistent maken met frontend (`context: ./mock-api`) zodat het patroon voor toekomstige services (`backend/`, `postgres/`) eenduidig blijft.

Het db.json punt heb ik niet als comment geplaatst (zie aandachtspunt 5), het is puur mock-data en weegt niet op tegen de moeite van een review-ronde.

## Patronen die ik straks volg voor mijn iteratie 3

Wat ik direct kan kopieren naar `backend/` en `postgres/`:

- **Multi-stage Dockerfile** (base -> deps -> development / build -> production). Voor NestJS: `base` met node:22-alpine + corepack + pnpm, `deps` voor `pnpm install`, `development` voor `pnpm start:dev`, `build` + `production` voor compileren en optimaliseren.
- **Build context = service map** (consistent maken met wat ik aanraad voor mock-api).
- **Volumes voor hot reload** met named volumes voor node_modules en pnpm store.
- **README per service** met installatie- en Docker-instructies.
- **Configurable env vars met defaults** (`${ANTHROPIC_API_KEY}`, `${POSTGRES_PASSWORD:-fontys}`).
- **Profile-based services** voor optionele containers (bijv. een seed-container of een one-off migration-runner).

Wat ik er aan toevoeg dat hier nog niet is:

- **Postgres + pgvector container** met init-script voor schema en pgvector-extension.
- **Healthcheck op postgres** zodat backend pas start als de DB ready is.
- **Backend-service in de compose** met `depends_on: postgres: { condition: service_healthy }`.
- **Workspace uitbreiden** met `backend` als die in de pnpm workspace komt.

## Concept compose-toevoeging voor mijn services

Als referentie voor mezelf, niet voor in deze PR:

```yaml
postgres:
  image: pgvector/pgvector:pg16
  ports: ["5432:5432"]
  environment:
    POSTGRES_USER: ${POSTGRES_USER:-fontys}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-fontys}
    POSTGRES_DB: ${POSTGRES_DB:-fontys_lms}
  volumes:
    - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    - postgres-data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-fontys}"]
    interval: 5s
    timeout: 3s
    retries: 5

backend:
  build:
    context: ./backend
    target: development
  ports: ["3000:3000"]
  environment:
    DATABASE_URL: postgresql://fontys:fontys@postgres:5432/fontys_lms
    ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
  volumes:
    - ./backend:/app
    - backend-node-modules:/app/node_modules
  depends_on:
    postgres:
      condition: service_healthy

volumes:
  postgres-data:
  backend-node-modules:
```

## Patroon dat ik doortrek: API-mode switch

Het mooiste van deze PR voor de toekomst is de `VITE_CHUCK_API_MODE` switch. Dat patroon kan ik doortrekken naar de hele app als `VITE_API_MODE`:

- `VITE_API_MODE=real` -> frontend praat tegen NestJS op `http://localhost:3000`
- `VITE_API_MODE=mock` -> frontend praat tegen json-server op `http://localhost:3002`
- Per feature kan dat zelfs apart: chatbot tegen NestJS, een nog-niet-gebouwde "leerdoel"-feature tegen mock

**Waarom dit slim is:**

- Jan kan doorbouwen aan UI-features voordat het bijbehorende NestJS endpoint klaar is
- Storybook stories kunnen mock data gebruiken zonder dat ze een echte backend nodig hebben
- E2E-tests kunnen voorspelbare data gebruiken zonder de echte DB te raken
- Edge cases (lege state, error state, 100 items) zijn makkelijker te triggeren via mock

**Belangrijk:** mijn chatbot-endpoint draait altijd tegen NestJS. Mock-mode voor de chatbot heeft geen zin (Claude API kun je niet mocken via json-server, en function calling moet tegen echte data). Dus per feature kiezen, niet als globale switch.

Dit is geen wijziging op deze PR maar een lijn die ik vasthoud zodra ik mijn eigen endpoints toevoeg.

## Conclusie

Solide werk van Jan. Het patroon klopt, de Dockerfiles zijn netjes opgezet, en de documentatie staat per service waar je hem zoekt. Eén consistency-comment geplaatst, geen blocker. Ik kan na merge direct verder met `backend/` en `postgres/` zonder dat ik eerst structurele dingen op de schop hoef te gooien.
