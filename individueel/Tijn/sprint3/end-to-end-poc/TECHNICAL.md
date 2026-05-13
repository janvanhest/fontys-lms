# Technische documentatie

End-to-end Proof of Concept voor een hybride RAG + function calling chatbot. Onderdeel van het Fontys LMS challenge-project van Tijn Knapen, sprint 3.

## Doel

Bewijzen dat een chatbot officiele HBO-i competentiedefinities (statische kennis) en persoonlijke studentdata (dynamische data) kan combineren in een enkel antwoord, zonder dat de architectuur dat per use case hardcodeert. De LLM beslist zelf welk patroon hij wanneer aanroept op basis van de vraag.

Dit is een **vertical slice**: de minimale end-to-end implementatie die het hybride patroon aantoont, niet een productie-systeem.

## Architectuur

```
[browser]
    |
    |  HTTP / Server-Sent Events
    v
[NestJS backend - container, poort 3000]
 |  /                      static chat UI (HTML/JS + marked v12)
 |  /api/chat              synchrone tool-use loop
 |  /api/chat/stream       SSE met live progress events
 |  /api/db/*              DB viewer endpoints (read + write)
 |  /api/info              live stack info + system prompt + tools
 |  /api/docs              Swagger UI
 |
 +--> [Anthropic Claude Sonnet 4.5]
 |       chat + tool-use beslissingen
 |       via @anthropic-ai/sdk
 |
 +--> [Ollama nomic-embed-text]
 |       lokale embeddings, 768 dimensies
 |       host.docker.internal:11434
 |       AVG-safe, draait op de host buiten Docker
 |
 +--> [PostgreSQL 16 + pgvector - container]
         student, voortgang, activiteit    (relationeel)
         hbo_chunk                         (vector met embedding)
```

Twee services in Docker Compose:
- `postgres` (image `pgvector/pgvector:pg16`)
- `backend` (build van `./backend`, base `node:20-alpine` met pnpm via corepack)

Ollama draait expliciet **niet** in Compose. Dit volgt ADR-03 van het bredere project: lokale embeddings op de host, container bereikt het via `host.docker.internal`. Reden: GPU-toegang vanuit Docker is op Windows lastig, en Ollama hoort sowieso lokaal te draaien voor de developer.

## NestJS modules

Elke module heeft een afgebakende verantwoordelijkheid. Alles wordt via DI gekoppeld in `app.module.ts`.

| Module | Verantwoordelijkheid |
|---|---|
| DatabaseModule | `PgService`: pg.Pool met retry-logic op opstart, query-passthrough. Global module zodat andere modules niet expliciet hoeven te importeren. |
| EmbeddingModule | `EmbeddingService`: thin wrapper rond Ollama `/api/embeddings`. Geen retries, geen caching. |
| ToolsModule | `ToolsService`: handlers voor de vier tools die Claude kan aanroepen. Map tussen tool-naam en backend-actie. |
| ChatModule | `ChatController`: twee endpoints (synchroon en SSE). `ChatService`: tool-use loop met Anthropic SDK. `prompts.ts`: system prompt builder. |
| SeedModule | `SeedService`: implements `OnModuleInit`. Vult Postgres met studenten en HBO-i chunks bij elke backend boot. |
| DbModule | `DbController`: read en write endpoints op de DB voor de UI-viewers in tab Relationele DB en Vector DB. |
| InfoModule | `InfoController`: live stack info, system prompt en tool-definities voor de Info tab. |

## Frontend

Pure HTML en vanilla JavaScript in `backend/public/`. Bewust geen build step.

- `index.html`: layout met 4 tabs (Chat, Relationele DB, Vector DB, Info). CSS inline.
- `app.js`: tab-routing, chat streaming via fetch + SSE-parsing, DB viewer-rendering, Info loader, markdown rendering.
- Externe library: `marked` v12 via CDN voor markdown rendering van assistant-antwoorden.

Server via `@nestjs/serve-static` op `/`, met exclude op `/api*` zodat de API niet conflicteert.

## De drie patronen

### Patroon 1: RAG (Retrieval Augmented Generation)

Voor statische, gedeelde kennis die voor elke gebruiker hetzelfde is.

```
user query
   |
   v
embedding (Ollama nomic-embed-text, 768 dim)
   |
   v
cosine similarity search in pgvector (SELECT ... ORDER BY embedding <=> $1)
   |
   v
top-k chunks met laag, activiteit, niveau, content, similarity
   |
   v
terug naar Claude als tool_result
```

- Tool: `search_hbo_competentie(query, top_k)`
- Datasource: `hbo_chunk` tabel
- Wanneer: vragen over HBO-i competentiedefinities

### Patroon 2: Function calling

Voor dynamische, gestructureerde data die per gebruiker verschilt.

```
user query
   |
   v
Claude beslist tool + parameters
   |
   v
ToolsService voert SQL query uit met die parameters
   |
   v
rows terug naar Claude als tool_result
```

- Tools: `get_student_profiel`, `get_student_voortgang`, `get_student_activiteiten`
- Datasources: `student`, `voortgang`, `activiteit` tabellen
- Wanneer: vragen over eigen voortgang, planning of profiel

### Patroon 3: Hybride

Beide patronen tegelijk in een vraag waar de student om gepersonaliseerd advies vraagt op basis van een competentie.

Voorbeeld: *"Ik wil Infrastructure Analyse niveau 2 behalen. Wat moet ik doen?"*

```
1. Claude: search_hbo_competentie("Infrastructure Analyse niveau 2")
   --> officiele definitie van niveau 2
2. Claude: get_student_voortgang(1, "Infrastructure", "Analyse")
   --> Sams huidige stand: niveau 1 behaald, niveau 2 bezig
3. Claude: combineert beide tot een concreet advies dat zowel de officiele
   eisen noemt als waar deze student staat
```

Geen architectuur-routing nodig: Claude beslist welk patroon wanneer, gestuurd door zijn system prompt en de descriptions van de tools.

## Data flow van een streaming chatvraag

```
1. Browser: POST /api/chat/stream { message, student_id, history }
2. ChatController.stream:
     setHeader Content-Type: text/event-stream
     wrap send() callback
     await chat.handleStreaming(body, send)
3. ChatService.run iteratie 1:
     emit 'status' { phase: 'thinking' }
     Anthropic.messages.create({ model, system, tools, messages })
4. Claude antwoord:
     stop_reason: 'tool_use'
     content: [ToolUseBlock { name, id, input }]
5. ChatService voor elke tool_use:
     emit 'tool_call' { name, input }
     await ToolsService.execute(name, input)
       --> SQL query of vector search
     emit 'tool_result' { name, count }
     bouwt tool_result block
6. ChatService: push tool_use en tool_result naar messages array
7. ChatService.run iteratie 2:
     emit 'status' { phase: 'writing' }
     Anthropic.messages.create(...)
8. Claude antwoord: stop_reason: 'end_turn'
9. ChatService:
     emit 'final' { answer, tool_calls }
     return
10. Browser:
     parseert SSE events live
     update status-bar bij elke event
     rendert finale antwoord via marked.parse()
     toont uitklapbare tool-call traces
```

Max 6 iteraties als safety net tegen infinite loops.

## Database schema

```sql
-- pgvector extension aanzetten
CREATE EXTENSION IF NOT EXISTS vector;

student (
  id              SERIAL PRIMARY KEY,
  naam            TEXT NOT NULL,
  opleiding       TEXT,
  semester        INTEGER,
  project_beschrijving TEXT
)

voortgang (
  id              SERIAL PRIMARY KEY,
  student_id      INTEGER REFERENCES student(id) ON DELETE CASCADE,
  laag            TEXT NOT NULL,
  activiteit      TEXT NOT NULL,
  niveau_behaald  INTEGER,
  niveau_bezig    INTEGER,
  toelichting     TEXT
)
-- INDEX voortgang_student_idx ON voortgang(student_id)

activiteit (
  id              SERIAL PRIMARY KEY,
  student_id      INTEGER REFERENCES student(id) ON DELETE CASCADE,
  titel           TEXT NOT NULL,
  type            TEXT,
  datum           DATE,
  afgerond        BOOLEAN DEFAULT false,
  beschrijving    TEXT
)
-- INDEX activiteit_student_datum_idx ON activiteit(student_id, datum)

hbo_chunk (
  id              SERIAL PRIMARY KEY,
  laag            TEXT,
  activiteit      TEXT,
  niveau          INTEGER,
  content         TEXT NOT NULL,
  embedding       vector(768)
)
-- geen index: sequential scan op 15 rijen is microseconden
-- (ivfflat bewust weggelaten omdat hij op een lege tabel niet werkt)
```

Schema staat in `postgres/init/01-init.sql`, eenmalig uitgevoerd door de postgres-image bij eerste opstart van het volume.

## Seed flow

Bij elke `backend` opstart draait `SeedService.onModuleInit`:

**`seedStudents()`**
1. Check of `student` tabel rijen heeft. Zo ja: skip.
2. Lees `seed/students.json`.
3. Voor elke student: INSERT in `student`, dan voor elke voortgang en activiteit INSERT in respective tabellen.

**`seedHboChunks()`**
1. Defensief: `DROP INDEX IF EXISTS hbo_chunk_embedding_idx` (voor het geval een oude ivfflat-index nog rondzwerft).
2. Altijd: `DELETE FROM hbo_chunk` (forceer fresh seed bij elke restart, scheelt synchronisatieproblemen).
3. Lees `seed/hbo-i-infrastructure.md`.
4. Split op `## ` headers, parse `laag - activiteit - Niveau N` uit elke header.
5. Prepend de heading aan de body content. Dat is cruciaal: zonder de heading in de embedded tekst kunnen embeddings van niveau 1, 2 en 3 van dezelfde activity niet goed van elkaar onderscheiden worden.
6. Voor elke chunk: embed via Ollama, INSERT in `hbo_chunk`.

**Trade-off**: handmatig toegevoegde chunks via de Vector DB UI gaan verloren bij backend restart. Voor PoC acceptabel, want de seed-content is de baseline. In productie zou je een `source` kolom toevoegen (`seed` vs `manual`) en alleen de seed-rijen wissen.

## API endpoints

| Method | Path | Doel |
|---|---|---|
| POST | /api/chat | Synchrone chat. Retourneert het volledige antwoord plus tool_calls trace. Voor Swagger en curl. |
| POST | /api/chat/stream | SSE stream. Events: status, tool_call, tool_result, final, error. Gebruikt door de chat UI. |
| GET | /api/db/students | Alle studenten met voortgang en activiteiten genest in JSON. |
| GET | /api/db/hbo-chunks | Alle HBO-i chunks zonder raw embedding (alleen metadata + content). |
| POST | /api/db/hbo-chunks | Nieuwe chunk toevoegen. Body `{ laag, activiteit, niveau, content }`. Server embed via Ollama en INSERTs. |
| PUT | /api/db/hbo-chunks/:id | Bestaande chunk bijwerken. Server re-embedt automatisch. |
| DELETE | /api/db/hbo-chunks/:id | Chunk verwijderen. |
| GET | /api/info | Live stack info, counts, system prompt, tool-definities. |
| GET | /api/docs | Swagger UI met alle endpoints uit `@ApiTags` decorators. |

Alle endpoints onder `/api/*` door `app.setGlobalPrefix('api')` in `main.ts`. Static frontend op `/` via `@nestjs/serve-static` met exclude op `/api*`.

## Bestandstructuur

```
end-to-end-poc/
+-- docker-compose.yml             postgres + backend
+-- .env.example
+-- README.md
+-- INSTALL.md
+-- TECHNICAL.md  (dit bestand)
+-- postgres/
|   +-- init/
|       +-- 01-init.sql            schema + pgvector extension
+-- seed/
|   +-- hbo-i-infrastructure.md    15 HBO-i chunks (Infrastructure laag)
|   +-- students.json              3 studenten met voortgang en activiteiten
+-- backend/
    +-- Dockerfile                 Node 20 + pnpm via corepack
    +-- .dockerignore
    +-- package.json
    +-- tsconfig.json
    +-- nest-cli.json
    +-- public/
    |   +-- index.html             4 tabs + scenarios + viewers
    |   +-- app.js                 tab-routing, streaming, viewers, info loader
    +-- src/
        +-- main.ts                bootstrap, Swagger, CORS, global prefix
        +-- app.module.ts
        +-- database/
        |   +-- database.module.ts
        |   +-- pg.service.ts      pg.Pool met retry op opstart
        +-- embedding/
        |   +-- embedding.module.ts
        |   +-- embedding.service.ts   Ollama nomic-embed-text wrapper
        +-- tools/
        |   +-- tools.module.ts
        |   +-- tools.service.ts   4 tool handlers (search + 3x SQL)
        |   +-- tool-definitions.ts    schemas zoals Claude ze ziet
        +-- chat/
        |   +-- chat.module.ts
        |   +-- chat.controller.ts     POST /api/chat en /api/chat/stream
        |   +-- chat.service.ts        tool-use loop met streaming events
        |   +-- prompts.ts             system prompt builder
        |   +-- dto/
        |       +-- chat-request.dto.ts
        |       +-- chat-response.dto.ts
        +-- seed/
        |   +-- seed.module.ts
        |   +-- seed.service.ts        OnModuleInit, leest seed/ map
        +-- db/
        |   +-- db.module.ts
        |   +-- db.controller.ts       read + write op beide DB's
        +-- info/
            +-- info.module.ts
            +-- info.controller.ts     live status, prompt, tools
```

## Configuratie

Environment variables, geladen via `@nestjs/config` (global ConfigModule).

| Variabele | Default | Doel |
|---|---|---|
| POSTGRES_DB | lmsdb | Database naam |
| POSTGRES_USER | lmsuser | DB user |
| POSTGRES_PASSWORD | lmspass | DB password |
| DATABASE_URL | postgresql://lmsuser:lmspass@localhost:5432/lmsdb | Voor lokale dev commands |
| DOCKER_DATABASE_URL | postgresql://lmsuser:lmspass@postgres:5432/lmsdb | Container-naar-container connection |
| ANTHROPIC_API_KEY | (verplicht) | Claude API key |
| OLLAMA_URL | http://host.docker.internal:11434 | Ollama endpoint, vanaf de container gezien |
| PORT | 3000 | Backend listen poort |
| SEED_DIR | /seed | Pad naar seed-files in de container (gemount vanuit `./seed`) |

## Tool-definities

Vier tools die Claude tot zijn beschikking heeft. Definities in `backend/src/tools/tool-definitions.ts`, ook zichtbaar in de Info tab.

```
search_hbo_competentie(query: string, top_k: integer = 5)
  --> vector search in hbo_chunk

get_student_profiel(student_id: integer)
  --> SELECT FROM student

get_student_voortgang(student_id: integer, laag?: string, activiteit?: string)
  --> SELECT FROM voortgang met optionele filters

get_student_activiteiten(student_id: integer, vanaf?: string, tot?: string)
  --> SELECT FROM activiteit met optionele datumrange
```

Claude kiest zelf welke tool met welke parameters op basis van de description-velden en het system prompt.

## System prompt

Live te zien in de Info tab. Kernpunten:

- "Je bent een studieassistent voor HBO-ICT studenten aan Fontys"
- "De huidige gebruiker heeft student_id N. Gebruik dat id voor alle student-tools"
- "Roep search_hbo_competentie aan voor HBO-i definities, get_student_* voor persoonlijke data"
- "De metadata (laag/activiteit/niveau) in de search-result is autoritatief"
- "Vertrouw de eerste search-hit, herhaal max 1 keer"
- "Combineer officiele definitie met student-status tot concreet advies"
- "Antwoord in Nederlands, kort, geen em-dashes"

Volledige tekst in `backend/src/chat/prompts.ts`.

## HBO-i Infrastructure niveau 1 onderbouwing

Wat dit PoC concreet aantoont voor mijn portfolio:

### Analyse-I1
Keuze-onderbouwing tussen PostgreSQL met pgvector versus alternatieven (Pinecone, Qdrant), Ollama lokaal versus managed embeddings (Voyage AI, OpenAI), Claude API versus lokaal model (Qwen). Trade-offs gedocumenteerd in `sprint3/lijstje-POC.md`.

### Advise-I1
ADR-03 (Ollama lokaal voor PoC, Voyage AI als productie-pad, AVG-overweging). Patroon-scheiding tussen RAG en function calling op basis van data-eigenschappen (statisch/dynamisch, gedeeld/per-gebruiker). Hardcoded markdown seed in plaats van directe Canvas API om scope te beheersen.

### Design-I1
High-level architectuur (3 services in Compose, container-grenzen, externe afhankelijkheden). Low-level schema (4 tabellen plus vector kolom, foreign keys, indexen). Tool-definities met JSON schemas. Module-structuur in NestJS met duidelijke verantwoordelijkheden per module.

### Realise-I1
Werkende Docker Compose stack. NestJS backend container die praat met Postgres container via servicenaam en met Ollama via `host.docker.internal`. End-to-end chat met live tool-traces en server-side embedding pipeline.

### Manage-Control-I1
Reset-procedure (`docker compose down -v` voor volledig of `restart backend` voor alleen vector chunks). Installatiehandleiding (`INSTALL.md`). Structured logging via NestJS Logger met module-context. Idempotent seed-script.

## Bekende beperkingen

- **Geen tests**: unit noch e2e. Bewust niet voor PoC.
- **Geen auth**: `student_id` komt uit request body, default 1. In productie LTI 1.3 via Canvas.
- **CORS open**: `app.enableCors()` zonder origin restrictie.
- **Handmatige chunks gaan verloren bij restart**: trade-off voor consistente seed. Source-kolom oplossing in productie.
- **Niveau 2 en 3 HBO-i content is geparafraseerd**: niet de officiele HBO-i tekst, voor portfolio-onderbouwing valideren tegen de Domeinbeschrijving 2024 (zie disclaimer in `seed/hbo-i-infrastructure.md`).
- **Anthropic-client niet mockbaar**: directe `new Anthropic(...)` in service constructor. Voor tests zou hij via een provider geinjecteerd moeten worden.
- **`process.env` direct gebruikt** in EmbeddingService en ChatService in plaats van via ConfigService.
- **Geen pgvector index**: sequential scan op 15 chunks is instant. Bij 1000-plus chunks zou je HNSW willen toevoegen, na het seeden.
- **Frontend in vanilla HTML/JS**: geen consistency met React+MUI team-stack. Bewuste keuze voor scope, niet voor pattern.

## Toekomstig werk

Productie-richting (niet voor sprint 3):

- **Tests**: unit voor ToolsService en ChatService, e2e voor de endpoints.
- **ConfigService** met env-validation via zod of Joi.
- **Anthropic-client als provider** voor mockability.
- **DTO-validation** op DbController inputs (class-validator decorators op `HboChunkInput`).
- **Strict TypeScript** mode in tsconfig.
- **LTI 1.3 auth** in plaats van hardcoded student_id.
- **Canvas API integratie** in plaats van markdown-seed (productie-pad uit ADR-10).
- **HNSW index** op `hbo_chunk.embedding` als content groeit boven duizend chunks.
- **Frontend in React + MUI** voor consistency met team-stack.
- **Rate limiting** op chat endpoints.
- **Structured tracing** met OpenTelemetry voor productie-observability.
- **Source-kolom op hbo_chunk** zodat handmatig toegevoegde chunks restart overleven.

## Referenties

- HBO-i Domeinbeschrijving 2024: `Context/24040_HBOi_Domeinbeschrijving_ENG.pdf`
- Semesterplan: `Context/Semesterplan-v2.md`
- Iteratie planning: `sprint3/lijstje-POC.md`
- Database voorstel: `sprint3/db-ontwerp.md`
- Anthropic Tool Use docs: https://docs.anthropic.com/en/docs/build-with-claude/tool-use
- pgvector docs: https://github.com/pgvector/pgvector
- Ollama nomic-embed-text: https://ollama.com/library/nomic-embed-text
