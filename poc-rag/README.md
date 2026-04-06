# Fontys Studieassistent PoC

Lokale RAG proof-of-concept voor Fontys Pro Open Learning met NestJS, Vite, PostgreSQL + pgvector, optionele Ollama embeddings en optionele Anthropic generatie.

## Vereisten

- Docker + Docker Compose
- PostgreSQL 16 met pgvector draait via Docker Compose
- [Ollama](https://ollama.com) is optioneel voor fase 1 en alleen nodig als je vector embeddings wilt gebruiken
- Een Anthropic API key is optioneel voor fase 1 en nodig voor natuurlijkere LLM-antwoorden

## Wat doet wat?

- `PostgreSQL + pgvector`: slaat document-chunks en embeddings op, en voert vector similarity search uit.
- `Ollama`: maakt embeddings van tekst. Het is in deze PoC dus niet het chatmodel, maar de lokale embedding-provider.
- `Anthropic`: genereert een natuurlijk geformuleerd antwoord op basis van de gevonden context.

Concreet:
- zonder Ollama werkt de app nog steeds via keyword search
- met Ollama kan de backend embeddings maken en vector search gebruiken
- zonder Anthropic geeft de backend een lokale fallback-response terug op basis van de gevonden chunks
- met Anthropic worden antwoorden natuurlijker geformuleerd
- de backend stuurt bij antwoorden ook broninformatie mee, zodat zichtbaar is waar een antwoord vandaan komt

## Waarom `ollama pull nomic-embed-text`?

De backend gebruikt Ollama met het model `nomic-embed-text` om embeddings te maken.

Een embedding is een numerieke representatie van tekst:
- een stuk tekst wordt omgezet naar een lijst getallen
- die lijst probeert de betekenis van die tekst vast te leggen
- teksten met vergelijkbare inhoud krijgen vectors die dichter bij elkaar liggen

In deze PoC betekent dat:
- voor elk document-chunk wordt een vector gemaakt
- voor de vraag van de gebruiker wordt ook een vector gemaakt
- pgvector vergelijkt die vectors om de meest relevante chunks terug te vinden

Het commando:

```bash
ollama pull nomic-embed-text
```

downloadt dat embeddingmodel lokaal naar Ollama.

Je hebt deze stap alleen nodig als je de vector-search route wilt gebruiken.
Voor de eerste verticale slice is dat niet verplicht, omdat de backend ook
kan terugvallen op keyword search.

## Starten

```bash
# Maak eerst je lokale env-bestand
cp .env.example .env

# Optioneel: alleen nodig voor vector embeddings
ollama pull nomic-embed-text
ollama serve  # als het nog niet draait

# Optioneel: vul ANTHROPIC_API_KEY in in .env

# Start de applicatie
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/chat

## Configuratie via `.env`

De stack verwacht een root `.env` bestand in [poc-rag](/Users/jhhest/school/fontys-lms/poc-rag).

Gebruik:

```bash
cp .env.example .env
```

Belangrijk onderscheid:
- `DATABASE_URL`: voor lokale backend commands buiten Docker, zoals `pnpm run eval:retrieval`
- `DOCKER_DATABASE_URL`: voor de backend container binnen Docker Compose

Waarom twee varianten:
- buiten Docker draait Postgres meestal op `localhost`
- binnen Docker heet de database-host `postgres`

Docker Compose leest automatisch het root `.env` bestand in `poc-rag`.

Voor losse backend scripts geldt:
- draai ze met een geladen `DATABASE_URL`
- of exporteer die variabele eerst in je shell

## Retrieval eval runner

De retrieval eval runner controleert of de backend voor vaste voorbeeldvragen
de juiste chunks terugvindt.

De runner:
- gebruikt `SearchService`
- draait tegen de database
- gebruikt dus `DATABASE_URL` voor lokaal gebruik
- gebruikt niet `DOCKER_DATABASE_URL`

Voorwaarden:
- je hebt een root `.env` in `poc-rag`
- postgres draait lokaal via Docker Compose
- de database is al geseed

Aanbevolen volgorde:

```bash
cd poc-rag
cp .env.example .env  # alleen nodig als .env nog niet bestaat
docker compose up -d postgres
```

Daarna de runner starten met de env uit de root `.env` geladen:

```bash
cd poc-rag
set -a
source .env
set +a
pnpm --dir backend run eval:retrieval
```

Als je liever een one-liner gebruikt:

```bash
cd poc-rag && set -a && source .env && set +a && pnpm --dir backend run eval:retrieval
```

Wat je dan ziet:
- per query de verwachte titels
- de daadwerkelijk gevonden titels
- `PASS` of `FAIL`
- aan het einde een samenvatting zoals `summary: 6/8 passed`

Als de runner faalt met een databasefout:
- controleer of postgres draait
- controleer of `DATABASE_URL` in `.env` naar `localhost:5432` wijst
- gebruik lokaal `DATABASE_URL`, niet `DOCKER_DATABASE_URL`

## Architectuur

- `postgres/`: PostgreSQL 16 met pgvector-extensie (via `pgvector/pgvector:pg16` image)
- `backend/`: NestJS — seeding, sectie-gebaseerde content chunks, keyword search fallback, optionele Ollama-embeddings en optionele Anthropic-generatie
- `frontend/`: Vite + React + MUI chatinterface met compacte bronweergave onder assistentantwoorden
- Embeddings draaien lokaal via Ollama (`nomic-embed-text`, 768 dimensies) wanneer beschikbaar

## Verticale slice fase 1

De eerste werkende slice vereist alleen:
- frontend
- backend
- postgres

De applicatie blijft bruikbaar als deze externe afhankelijkheden ontbreken:
- Ollama
- `ANTHROPIC_API_KEY`

Gedrag in fase 1:
- retrieval gebeurt via vector search als embeddings beschikbaar zijn
- anders valt de backend terug op keyword search
- als Anthropic beschikbaar is, wordt een natuurlijk antwoord gegenereerd
- anders geeft de backend een compacte response terug op basis van de best passende cursuschunks
- de backend levert ook `sources` terug met titel, bron en score van de gebruikte chunks
- de backend logt tijdelijk retrieval hits voor debugdoeleinden

## Seed en retrieval

De seed-content komt uit de Canvas-bronnen, maar wordt niet meer als volledige pagina's opgeslagen.

In plaats daarvan:
- wordt de content opgesplitst in kleinere secties
- krijgt elke sectie een eigen chunk in de `documents` tabel
- gebruikt retrieval die kleinere chunks voor gerichtere antwoorden

Daardoor:
- worden antwoorden compacter
- worden bronnen beter uitlegbaar
- is de kans kleiner dat complete pagina's worden teruggegeven als antwoord

## Endpoints

- `POST /api/chat` — `{ message, history }` → `{ answer, sources }`
- `GET /api/health`
