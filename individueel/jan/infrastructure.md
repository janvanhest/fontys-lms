**Project:** Activity First LMS
**Student:** Jan van Hest | Semester 6 | HBO-ICT Open Learning | Fontys
**Sprint:** 3
**HBO-i:** Infrastructuur x Niveau 1 (Taakgericht)

Dit document verantwoordt de infrastructuurkeuzes voor de Activity First LMS PoC. Het doorloopt alle vijf infrastructuur-activiteiten op niveau 1: analyseren, adviseren, ontwerpen, realiseren en manage & control. De infrastructuur bestaat uit een lokale Docker Compose setup met vijf services: React/Vite frontend, NestJS backend, PostgreSQL database, Ollama embedding service en een mock-API.

---

# Analyseren - Infrastructuuranalyse

**Beroepstaak:** Analyseren van een eenvoudige infrastructuur volgens een standaardmethode en op basis van gegeven kwaliteitseisen.

**Standaardmethode:** ISO/IEC 25010 - kwaliteitsmodel voor software en systemen. Gebruikt als kapstok voor het benoemen en wegen van kwaliteitseisen.

## Kwaliteitseisen per ISO 25010 attribuut

### Performance efficiency

De chatbot moet snel genoeg reageren om bruikbaar te zijn voor een student die een vraag stelt.

| Eis                                       | Drempelwaarde | Risico bij overschrijding                          |
| ----------------------------------------- | ------------- | -------------------------------------------------- |
| Chatbot eerste token zichtbaar            | < 3 seconden  | Student haakt af, vertrouwen in tool daalt         |
| REST endpoints (activiteiten, challenges) | < 500ms       | Panel voelt traag, gebruikerservaring verslechtert |
| Vector search (RAG retrieval)             | < 1 seconde   | Bottleneck in de chat-pipeline                     |

Geheugeninschatting per service bij PoC-gebruik (5-10 gelijktijdige gebruikers):

| Service                   | Geschat geheugen      |
| ------------------------- | --------------------- |
| NestJS backend            | 256-512 MB            |
| PostgreSQL + pgvector     | 512 MB - 1 GB         |
| Ollama (nomic-embed-text) | 2-4 GB (modelgewicht) |
| React/Vite frontend       | 128-256 MB            |

Ollama is de zwaarste service vanwege het modelgewicht. Op een MacBook met 16 GB RAM is dit acceptabel voor een PoC.

### Reliability

De PoC draait lokaal en heeft geen SLA-verplichting. Acceptabel voor een proefballon. Risico: als Ollama crasht, werkt de embedding-pipeline niet. Mitigatie: foutafhandeling in de Embedding Module geeft een duidelijke fout terug in plaats van een stille null-return.

De Ollama-container wacht via een healthcheck tot het `nomic-embed-text` model geladen is voordat de backend opstart. Dit voorkomt opstartfouten bij een koude start.

### Security

Studentdata wordt verwerkt. Kwaliteitseisen:

- Embeddings worden lokaal gegenereerd via Ollama — geen studentdata naar externe embedding-API
- API-sleutels worden beheerd via environment variables, nooit in code of version control
- Alle endpoints vereisen authenticatie via MockAuthGuard (PoC) of LtiAuthGuard (productie)
- PostgreSQL is niet publiek bereikbaar — alleen intern via Docker-netwerk

### Budget

| Component                 | Kosten PoC      |
| ------------------------- | --------------- |
| Ollama + nomic-embed-text | Gratis — lokaal |
| PostgreSQL + pgvector     | Gratis — lokaal |
| Hosting                   | Geen — lokaal   |

De PoC maakt geen gebruik van externe betaalde API's. Alle inferentie vindt lokaal plaats via Ollama.

### Duurzaamheid

Lokale embeddings via Ollama vermijden onnodige API-aanroepen naar externe diensten. Cursusinhoud wordt eenmalig geïndexeerd en niet bij elke chatbotaanroep opnieuw opgehaald.

---

# Adviseren - Hosting-keuze

**Beroepstaak:** Aanbevelingen doen over een opzet van, of aanpassingen aan, een eenvoudige infrastructuur.

## Keuze: lokaal Docker voor PoC

Voor de PoC is gekozen voor een volledig lokale Docker Compose setup. Deze keuze is onderbouwd in de ADR's van het architectuurdocument (ADR-03, ADR-06).

**Redenen:**

- Geen AVG-risico bij embeddings — studentdata verlaat het systeem niet
- Geen kosten voor hosting tijdens ontwikkeling
- Snelle iteratiecyclus — geen deployment nodig bij elke wijziging
- Ollama draait als container — geen lokale installatie vereist voor ontwikkelaars

**Nadelen lokaal:**

- Performance afhankelijk van hardware van de ontwikkelaar
- Niet schaalbaar naar meerdere gelijktijdige gebruikers
- Ollama-container vereist voldoende RAM (minimaal 8 GB aanbevolen)

## Naar productie

Bij opschaling naar een productie-omgeving zijn de volgende aanpassingen nodig:

| Component  | PoC                  | Productie                                    |
| ---------- | -------------------- | -------------------------------------------- |
| Embeddings | Ollama (container)   | Voyage AI of vergelijkbare managed service   |
| Auth       | MockAuthGuard        | LtiAuthGuard met Canvas developer key        |
| Hosting    | Lokaal Docker        | VPS of managed cloud (bijv. Railway, Fly.io) |
| Database   | Lokale PostgreSQL    | Managed PostgreSQL (bijv. Supabase, Neon)    |
| Mock-API   | json-server lokaal   | Canvas LMS API                               |
| Monitoring | Geen                 | Uptime monitoring + alerting                 |

De keuze voor lokale Docker is bewust tijdelijk — de architectuur is zo opgezet dat elke component los vervangen kan worden zonder de rest te raken.

---

# Ontwerpen - Infrastructuurspecificaties

**Beroepstaak:** Opstellen van specificaties voor een eenvoudige infrastructuur volgens een standaardmethode.

## Services en poorten

| Service             | Image                    | Poort (dev) | Poort (prod) | Verantwoordelijkheid                 |
| ------------------- | ------------------------ | ----------- | ------------ | ------------------------------------ |
| React/Vite frontend | node:20-alpine           | 5173        | 4173         | Chat UI, activiteitenpanel           |
| NestJS backend      | node:20-alpine           | 3000        | 3000         | API, RAG pipeline, tool use          |
| PostgreSQL          | pgvector/pgvector:pg16   | 5432        | 5432         | Relationele data + vector embeddings |
| Ollama              | ollama/ollama            | 11434       | 11434        | Lokale embeddings (nomic-embed-text) |
| mock-api            | node:20-alpine (custom)  | 3002        | 3002         | Gesimuleerde Canvas LMS API          |

## Docker Compose structuur

De infrastructuur is opgesplitst in drie bestanden:

**`compose.yaml`** — gedeelde base services (altijd actief):

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    env_file: .env
    ports: ["5432:5432"]
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]

  ollama:
    image: ollama/ollama
    ports: ["11434:11434"]
    volumes:
      - ollama_data:/root/.ollama
    # Serveert het model en trekt nomic-embed-text automatisch op eerste start
    healthcheck:
      test: ["CMD-SHELL", "ollama show nomic-embed-text >/dev/null 2>&1"]
      retries: 30

  mock-api:
    build: ./mock-api
    ports: ["3002:3002"]
    volumes:
      - ./mock-api/db.json:/app/db.json:ro
```

**`compose.override.yaml`** — development-specifieke overrides (automatisch meegeladen):

```yaml
services:
  backend:
    build:
      context: ./backend
      target: development
    environment:
      PORT: 3000
      NODE_ENV: development
      CORS_ORIGINS: http://localhost:5173
      OLLAMA_URL: http://ollama:11434
    ports: ["3000:3000"]
    develop:
      watch:
        - action: sync
          path: ./backend/src
          target: /app/src
        - action: rebuild
          path: ./backend/package.json
    depends_on:
      ollama:
        condition: service_healthy
      postgres:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      target: development
    environment:
      VITE_CHUCK_API_MODE: mock
      VITE_CHUCK_API_BASE_URL: http://localhost:3002
    ports: ["5173:5173"]
    develop:
      watch:
        - action: sync
          path: ./frontend/src
          target: /app/src
```

**`compose.prod.yaml`** — productie-overrides (expliciet meegeven via Makefile):

```yaml
services:
  backend:
    build:
      context: ./backend
      target: production
    environment:
      PORT: 3000
      NODE_ENV: production
      CORS_ORIGINS: http://localhost:4173
      OLLAMA_URL: http://ollama:11434
    ports: ["3000:3000"]

  frontend:
    build:
      context: ./frontend
      target: production
      args:
        VITE_CHUCK_API_MODE: mock
        VITE_CHUCK_API_BASE_URL: http://localhost:3002
    ports: ["4173:4173"]
```

## Makefile

Alle veelgebruikte commando's zijn gebundeld in een `Makefile` in de root:

| Commando    | Uitvoering                                                          | Toelichting                             |
| ----------- | ------------------------------------------------------------------- | --------------------------------------- |
| `make dev`  | `docker compose up --watch`                                         | Development stack met hot-reload        |
| `make prod` | `docker compose -f compose.yaml -f compose.prod.yaml up --build`   | Productie-build                         |
| `make down` | `docker compose down`                                               | Alle containers stoppen                 |
| `make test` | `cd backend && pnpm test -- --verbose`                              | Backend unit tests draaien              |

## Environment variabelen

Vereiste variabelen staan gedocumenteerd in `.env.example` in de root. De backend valideert deze bij opstarten via `class-validator`.

```
# Database
POSTGRES_USER=your_local_lms_user
POSTGRES_PASSWORD=your_local_lms_password
POSTGRES_DB=your_local_lms_db

# Backend
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173
OLLAMA_URL=http://ollama:11434
```

De backend accepteert de volgende waarden voor `NODE_ENV`: `development`, `production`, `test`. Overige waarden geven een validatiefout bij opstarten.

---

# Realiseren - PoC infrastructuur

**Beroepstaak:** Inrichten, testen en beschikbaar stellen van een proof of concept van een eenvoudige infrastructuur.

## Opstarten

```bash
# 1. Omgevingsvariabelen instellen
cp .env.example .env
# Vul POSTGRES_USER, POSTGRES_PASSWORD en POSTGRES_DB in

# 2. Development stack starten (hot-reload actief)
make dev

# 3. Database seeden
docker compose exec backend pnpm run seed:hboi
docker compose exec backend pnpm run seed:canvas
```

Bij eerste start trekt de Ollama-container automatisch het `nomic-embed-text` model op. De backend wacht via een healthcheck-afhankelijkheid totdat dit model beschikbaar is.

## Packages toevoegen aan de backend

De backend heeft een eigen `pnpm-lock.yaml` die Docker gebruikt. pnpm pikt echter de root `pnpm-workspace.yaml` op, waardoor een gewone `pnpm add` de verkeerde lockfile bijwerkt. Gebruik altijd:

```bash
cd backend
pnpm add <package> --ignore-workspace
```

## Testverslag

### Wat is getest

| Test                                       | Resultaat |
| ------------------------------------------ | --------- |
| Docker Compose start alle services         | Geslaagd  |
| PostgreSQL pgvector extensie actief        | Geslaagd  |
| Ollama container bereikbaar via het interne netwerk | Geslaagd  |
| nomic-embed-text model automatisch geladen | Geslaagd  |
| Embedding pipeline genereert vectors       | Geslaagd  |
| Vector search geeft relevante chunks terug | Geslaagd  |
| SSE streaming werkt in browser             | Geslaagd  |
| Activiteit aanmaken en ophalen via API     | Geslaagd  |
| Hot-reload backend bij bestandswijziging   | Geslaagd  |

### Wat NIET getest is en waarom

| Niet getest                                      | Reden                                                                   |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| Load testing (meerdere gelijktijdige gebruikers) | PoC is bedoeld voor 1-10 gebruikers, schalen is een productie-vraagstuk |
| Security penetration testing                     | Buiten scope voor een proefballon zonder echte studentdata              |
| Failover en herstelprocedures                    | Geen SLA-verplichting voor lokale PoC                                   |
| LTI 1.3 authenticatie                            | Canvas developer key niet beschikbaar binnen PoC-tijdlijn               |
| Productie-grade rate limiting                    | Testgroep te klein om dit te valideren                                  |

---

# Manage & Control - Runbook

**Beroepstaak:** Opzetten en documenteren van standaardbeheerprocessen en werkprocedures voor beheer van een eenvoudige infrastructuur.

## Dagelijks gebruik

```bash
# Development stack starten
make dev

# Productie-build starten
make prod

# Stack stoppen
make down
```

## Scenario 1: Backend start niet op

Oorzaak: ontbrekende environment variabele of PostgreSQL/Ollama nog niet klaar.

```bash
# Logs bekijken
docker compose logs backend

# Controleer of alle variabelen aanwezig zijn
cat .env

# Status van afhankelijke services controleren
docker compose ps postgres
docker compose ps ollama

# Backend opnieuw starten
docker compose restart backend
```

## Scenario 2: Ollama niet bereikbaar of model ontbreekt

Oorzaak: container nog niet opgestart of model nog aan het downloaden.

```bash
# Status controleren
docker compose ps ollama

# Logs bekijken (download-voortgang zichtbaar)
docker compose logs ollama

# Handmatig model controleren vanuit de container
docker compose exec ollama ollama list

# Health endpoint testen
curl http://localhost:11434/api/tags
```

## Scenario 3: Slechte chatbot-antwoorden na Canvas-update

Canvas-pagina's zijn aangepast maar de vector database bevat nog oude chunks.

```bash
# Herindexeer de Canvas-content
docker compose exec backend pnpm run seed:canvas

# Controleer aantal chunks in database
docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB \
  -c "SELECT COUNT(*) FROM chunks;"
```

## Scenario 4: Database reset

Bij een corrupte database of volledige herstart.

```bash
# Volumes verwijderen en opnieuw aanmaken
make down
docker compose down -v
make dev

# Opnieuw seeden
docker compose exec backend pnpm run seed:hboi
docker compose exec backend pnpm run seed:canvas
```

## API-sleutels en secrets beheer

- Alle secrets staan in `.env` — nooit committen naar git
- `.env` staat in `.gitignore`
- `.env.example` bevat alle vereiste variabelen zonder waarden — dit bestand wél committen
- Bij roteren van secrets: `.env` aanpassen en `docker compose restart backend`

## Monitoring (PoC)

Geen geautomatiseerde monitoring voor de PoC. Handmatige check via:

```bash
# Status alle services
docker compose ps

# Backend health endpoint
curl http://localhost:3000/health

# Database verbinding testen
docker compose exec postgres pg_isready

# Ollama beschikbaarheid testen
curl http://localhost:11434/api/tags
```
