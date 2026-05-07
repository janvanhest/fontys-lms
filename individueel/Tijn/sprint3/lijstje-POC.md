# Lijstje PoC chatbot - functionaliteit per iteratie

**Auteur:** Tijn Knapen
**Datum:** mei 2026
**Doel:** Mijn chatbot-iteraties op een rij zetten, naast die van Jan leggen, en op basis daarvan kiezen wat het uiteindelijke PoC-systeem wordt.

## Gemeenschappelijke uitgangspunten (al eens met Jan)

Een aantal architectuurkeuzes liggen al vast, ongeacht welke iteratie als basis wordt genomen:

- **Model:** Claude API (groepsbesluit mei 2026, los van Qwen 2.5 14B en Modal.com vervolgonderzoek)
- **Aanpak:** RAG (Retrieval Augmented Generation), niet alleen statische context
- **Database:** PostgreSQL
- **Vector store:** pgvector in dezelfde PostgreSQL, geen aparte vector-DB

## Mijn iteraties

### Iteratie 1 (afgerond, april 2026)

**Onderzoeksvraag:** kan een lokaal LLM betrouwbaar antwoorden op basis van JSON-context in de system prompt?

- Lokaal model via Ollama, GDPR-safe, geen externe API
- Modelkeuze: gestart met Llama 3.1 8B, afgekeurd na hallucinaties, geswitcht naar Qwen 2.5 14B (RTX 3080, ~9GB VRAM)
- Directe API-aanroep, geen framework
- Twee-laagse system prompt:
  - Laag 1 (statisch): competentiedefinities uit `competenties.json` + gedragsregels + datum
  - Laag 2 (per sessie): studentprofiel uit `student.json`
- Mock JSON, geen database
- Eén fictieve student
- Drie use cases getest:
  1. Voortgang + advies over een competentie ("hoe behaal ik niveau 2?")
  2. Planning opvragen ("wat staat er deze week?")
  3. Document koppelen aan competentie + project

**Eindstand:** chatbot leest gestructureerde context betrouwbaar, geen acties, geen DB.

### Iteratie 2 (afgerond, april 2026)

**Onderzoeksvraag:** kan PostgreSQL de mock JSON vervangen zonder kwaliteitsverlies?

- PostgreSQL 16 in Docker, `docker-compose.yml`, schema via entrypoint
- `psycopg` v3, bewust geen ORM, geen migratietool
- Schema met 4 tabellen: `student`, `competentie`, `student_competentie_voortgang`, `activiteit`
- Competenties opgeslagen als 25 rijen (5 lagen x 5 activiteiten) met JSONB voor de niveau-definities
- Eager loader module: `laad_student_context(student_id)` levert dict identiek aan iteratie 1
- Seed-script vult drie studenten (Sam infra, Jana UX, Omar software) met eigen voortgang
- Per-student testvragen via `students.json` (data-driven), vragen afgestemd op focus-laag
- Vier scenario's, nieuw: "wat heb ik afgelopen week afgerond" (tijdfilter)
- Geen regressie op de drie scenario's uit iteratie 1

**Bekende beperkingen aan einde iteratie 2:**

- Scope drift bij complexe vragen
- "Afgelopen week" wordt door model ruim geinterpreteerd (boundary issue)
- Alleen lezen, geen schrijven
- Niet schaalbaar voor docent-sessies (alle studentdata past niet in context)

### Iteratie 3 (gepland) - NestJS + Claude API + function calling

**Onderzoeksvraag:** kan een NestJS backend met Claude API en function calling de Python-prototypes uit iteratie 1 en 2 vervangen, en de chatbot productie-richting brengen?

- NestJS als backend-framework (TypeScript, modules, decorators), opgezet met pnpm
- Claude API via `@anthropic-ai/sdk` (groepsbesluit mei 2026, vervangt Ollama/Qwen)
- Function calling: model bepaalt zelf welke data het ophaalt
- Tools voor lezen:
  - `get_student_progress(user_id)`
  - `get_activities(user_id, datum_van, datum_tot)`
  - `get_competentie(naam, niveau)`
  - eventueel `get_student_by_name(...)` voor docent-flow
- Swagger UI voor API-documentatie en handmatig testen
- Postgres-koppeling vanuit NestJS (`pg` of `@nestjs/typeorm`)
- Schema uitbreiden met `course`, `project` als eigen tabel, `event`
- Docent-sessie wordt mogelijk: docent vraagt over student X, model haalt alleen die data
- Tijd-boundary probleem opgelost: model geeft datums door als parameter, code filtert
- Backend draait in Docker, opgenomen in root `docker-compose.yml` naast frontend, json-server en Postgres

### Iteratie 4 (gepland) - RAG met pgvector

**Onderzoeksvraag:** kan RAG via pgvector de chatbot betere antwoorden geven door alleen relevante context op te halen in plaats van alles vooraf in te laden?

- pgvector extension aan in de Postgres-container (init-script)
- Embedding pipeline: competentiedefinities, projectbeschrijvingen, eventueel Canvas-content omzetten naar vectors
- Retrieval-functie als tool: `search_context(query, top_k)`
- Combineren met function calling uit iteratie 3
- Lost het schaalprobleem op dat eager loading niet kon: niet alle data hoeft in de context
- Sluit aan op kernvraag: student krijgt antwoord op basis van relevante context, niet bulk-data

## Systeemoverzicht backend

Dit is hoe de NestJS-backend eruit komt te zien als iteratie 3 en 4 klaar zijn.

```
┌──────────────────────────────────────────────────────────────┐
│ Browser - frontend (React + MUI)                              │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP / JSON
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ NestJS backend container                                      │
│                                                               │
│  Controllers (HTTP + Swagger UI op /api)                      │
│   - ChatController         POST /chat                         │
│   - StudentController      GET  /students/:id                 │
│   - ActivityController     GET  /students/:id/activities      │
│   - CompetentieController  GET  /competenties/:code           │
│                          │                                    │
│                          ▼                                    │
│  Services                                                     │
│   - ChatService       Claude API + tool-loop                  │
│   - StudentService    studentdata uit DB                      │
│   - EmbeddingService  vector-zoekopdrachten                   │
│                          │                                    │
│                          ▼                                    │
│  Function calling tools (handlers die Claude kan aanroepen)   │
│   - get_student_progress     - get_competentie                │
│   - get_activities           - search_context (RAG)           │
│   - get_student_by_name                                       │
│                          │                                    │
│                          ▼                                    │
│  Database access (pg of @nestjs/typeorm)                      │
└────────────┬─────────────────────────────┬───────────────────┘
             │                             │
             ▼                             ▼
┌────────────────────────────┐  ┌──────────────────────────────┐
│ Postgres + pgvector         │  │ Claude API                   │
│ (eigen container)           │  │ (api.anthropic.com)          │
│  - student                  │  │  - messages endpoint         │
│  - competentie              │  │  - tool use (function call)  │
│  - student_competentie_     │  │                              │
│      voortgang              │  │                              │
│  - activiteit               │  │                              │
│  - course / project / event │  │                              │
│  - embeddings (pgvector)    │  │                              │
└────────────────────────────┘  └──────────────────────────────┘
```

**Voorbeeld flow van een chat-vraag:**

1. Frontend stuurt `POST /chat` met `{ user_id, message }`
2. `ChatController` geeft door aan `ChatService`
3. `ChatService` roept Claude API aan met system prompt + tools-lijst + user message
4. Claude besluit: "ik heb voortgang van deze student nodig" en stuurt een tool-call terug
5. NestJS voert `get_student_progress(user_id)` uit, query naar Postgres
6. Resultaat gaat terug naar Claude
7. Claude doet eventueel nog een tool-call (bijv. `search_context` voor RAG-context)
8. Claude vormt eindantwoord, NestJS stuurt dat terug naar de frontend

**Wat erbuiten valt:**

- Frontend: React + MUI, draait in eigen container
- json-server: mockt frontend-only data tijdens dev, niet door NestJS gebruikt
- Beide alleen genoemd zodat duidelijk is wat de root `docker-compose.yml` opstart

**Externe afhankelijkheden:**

- Claude API key in `.env` (niet in repo)
- Postgres-credentials in `.env`, lokaal default, productie via Neon (optioneel)

## Project layout (afspraak met Jan)

Multi-service Docker pattern. Elke service krijgt een eigen submap met een eigen `Dockerfile`. De project-root krijgt één `docker-compose.yml` die alles tegelijk start.

```
fontys-lms/
├── docker-compose.yml      <- regie, bovenop
├── .env                    <- shared variabelen (Claude key, DB-creds)
├── backend/
│   ├── Dockerfile          <- NestJS image
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── src/...
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/...
├── json-server/
│   ├── Dockerfile (of inline in compose)
│   └── db.json
└── postgres/
    └── init.sql            <- pgvector aanzetten + schema seed
```

`docker-compose.yml` ruwweg:

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    volumes:
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports: ["5432:5432"]

  backend:
    build: ./backend
    depends_on: [postgres]
    env_file: .env
    ports: ["3000:3000"]

  frontend:
    build: ./frontend
    ports: ["5173:5173"]

  json-server:
    build: ./json-server
    ports: ["3001:3001"]
```

`build: ./backend` betekent: ga naar `backend/`, gebruik die `Dockerfile`. Iedereen beheert zijn eigen submap, de root-compose voegt het samen. Eén commando start alles: `docker compose up -d`.

**Waarom dit slim is:**

- Services bereiken elkaar via servicenaam over het compose-netwerk (backend praat tegen `postgres:5432`, niet `localhost:5432`)
- Sluit aan op productie-deploy patterns
- Past op infra niveau 1: één commando voor opstarten of resetten, simpel te documenteren

## Eisen Infrastructure niveau 1 (mijn portfolio)

Het verhaal voor niveau 1 zit niet in technische complexiteit maar in **completeness**. Vijf vakjes die vol moeten zijn:

- **Analyse:** waarom Docker, waarom Postgres + pgvector, waarom Neon erbij (optioneel)
- **Advies:** hoe het team het gebruikt, hoe lokaal vs shared werkt
- **Ontwerp:** 2 diagrammen (high-level + low-level)
- **Realisatie:** compose draait, alle services praten met elkaar
- **Manage & Control:** installatiehandleiding + reset-procedure

Niveau 1 vraagt geen HA, geen monitoring, geen IaC, geen CI/CD. Niet meer doen dan dit.

## Volgorde van werken

1. NestJS scaffold met pnpm + Dockerfile (cleane basis)
2. Postgres + pgvector container in root `docker-compose.yml`
3. NestJS aansluiten op Postgres (eerst gewoon read endpoint)
4. Swagger UI aanzetten
5. Function calling tools toevoegen (lezen) - iteratie 3 inhoudelijk
6. Diagrammen (high-level + low-level) + installatiehandleiding
7. Iteratie 3 afronden, iteratie 4 starten (RAG / embedding pipeline)
8. **Optioneel:** Neon.tech opzetten naast lokale compose voor shared team-instance

## Vergelijking met Jan

(Aanvullen zodra Jan zijn lijstje heeft.)


| Onderdeel                  | Tijn                                                                                                                                | Jan | Keuze PoC  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --- | ---------- |
| Model                      | Lokaal Qwen 2.5 14B via Ollama, daarna over op Claude API                                                                           |     | Claude API |
| Database                   | PostgreSQL 16 in Docker, schema via entrypoint, geen migratietool                                                                   |     | PostgreSQL |
| Vector store               | Nog niet gebruikt, pgvector wel als toekomstige optie meegenomen in keuze                                                           |     | pgvector   |
| Retrieval-strategie        | Eager loading van complete studentcontext per sessie, RAG nog niet                                                                  |     | RAG        |
| Function calling lezen     | Niet gebouwd, wel ontworpen voor iteratie 3 (`get_student_progress`, `get_activities`, `get_competentie`)                           |     |            |
| Function calling schrijven | Niet gebouwd, ontworpen voor iteratie 4 (`update_activity`, `update_progress`, `add_activity`)                                      |     |            |
| Schema                     | 4 tabellen: `student`, `competentie`, `student_competentie_voortgang`, `activiteit`. Competenties als 25 rijen met JSONB definities |     |            |
| Loader / context-opbouw    | `loader.py` met `laad_student_context(student_id)`, drie queries, dict-output identiek aan iteratie 1 JSON                          |     |            |
| Test-aanpak                | Per-student vragen in `students.json` (data-driven), vier scenario's per student, afgestemd op focus-laag                           |     |            |


