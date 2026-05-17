**Project:** Activity First LMS
**Student:** Jan van Hest | Semester 6 | HBO-ICT Open Learning | Fontys
**Sprint:** 3
**HBO-i:** Infrastructuur x Niveau 1 (Taakgericht)

Dit document verantwoordt de infrastructuurkeuzes voor de Activity First LMS PoC. Het doorloopt alle vijf infrastructuur-activiteiten op niveau 1: analyseren, adviseren, ontwerpen, realiseren en manage & control. De infrastructuur bestaat uit een lokale Docker Compose setup met vier services: Next.js frontend, NestJS backend, PostgreSQL database en een externe Ollama instantie op de hostmachine.

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
| Next.js frontend          | 128-256 MB            |

Ollama is de zwaarste service vanwege het modelgewicht. Op een MacBook met 16GB RAM is dit acceptabel voor een PoC.

### Reliability

De PoC draait lokaal en heeft geen SLA-verplichting. Acceptabel voor een proefballon. Risico: als Ollama crasht, werkt de embedding-pipeline niet. Mitigatie: foutafhandeling in de Embedding Module geeft een duidelijke fout terug in plaats van een stille null-return.

### Security

Studentdata wordt verwerkt. Kwaliteitseisen:

- Embeddings worden lokaal gegenereerd via Ollama - geen studentdata naar externe embedding-API
- API-sleutels worden beheerd via environment variables, nooit in code of version control
- Alle endpoints vereisen authenticatie via MockAuthGuard (PoC) of LtiAuthGuard (productie)
- PostgreSQL is niet publiek bereikbaar - alleen intern via Docker netwerk

### Budget

| Component                     | Kosten PoC                  |
| ----------------------------- | --------------------------- |
| Ollama + nomic-embed-text     | Gratis - lokaal             |
| PostgreSQL + pgvector         | Gratis - lokaal             |
| Anthropic API (Claude Sonnet) | ~euro 0,01-0,05 per gesprek |
| Hosting                       | Geen - lokaal               |

Voor een testgroep van 10 studenten met 5 gesprekken per week: verwachte kosten minder dan euro 10 per maand.

### Duurzaamheid

Lokale embeddings via Ollama vermijden onnodige API-aanroepen naar externe diensten. Cursusinhoud wordt eenmalig geindexeerd en niet bij elke chatbotaanroep opnieuw opgehaald.

---

# Adviseren - Hosting-keuze

**Beroepstaak:** Aanbevelingen doen over een opzet van, of aanpassingen aan, een eenvoudige infrastructuur.

## Keuze: lokaal Docker voor PoC

Voor de PoC is gekozen voor een volledig lokale Docker Compose setup. Deze keuze is onderbouwd in de ADR's van het architectuurdocument (ADR-03, ADR-06).

**Redenen:**

- Geen AVG-risico bij embeddings - studentdata verlaat het systeem niet

- Geen kosten voor hosting tijdens ontwikkeling

- Snelle iteratiecyclus - geen deployment nodig bij elke wijziging

- Ollama vereist GPU of voldoende RAM - beheerst op een developer machine

**Nadelen lokaal:**

- Onboarding vereist Ollama-installatie per ontwikkelaar

- Performance afhankelijk van hardware van de ontwikkelaar

- Niet schaalbaar naar meerdere gelijktijdige gebruikers

## Naar productie

Bij opschaling naar een productie-omgeving zijn de volgende aanpassingen nodig:

| Component  | PoC               | Productie                                    |
| ---------- | ----------------- | -------------------------------------------- |
| Embeddings | Ollama lokaal     | Voyage AI of vergelijkbare managed service   |
| Auth       | MockAuthGuard     | LtiAuthGuard met Canvas developer key        |
| Hosting    | Lokaal Docker     | VPS of managed cloud (bijv. Railway, Fly.io) |
| Database   | Lokale PostgreSQL | Managed PostgreSQL (bijv. Supabase, Neon)    |
| Monitoring | Geen              | Uptime monitoring + alerting                 |

De keuze voor lokale Docker is bewust tijdelijk - de architectuur is zo opgezet dat elke component los vervangen kan worden zonder de rest te raken.

---

# Ontwerpen - Infrastructuurspecificaties

**Beroepstaak:** Opstellen van specificaties voor een eenvoudige infrastructuur volgens een standaardmethode.

## Services en poorten

| Service          | Image                  | Poort | Verantwoordelijkheid                 |
| ---------------- | ---------------------- | ----- | ------------------------------------ |
| Next.js frontend | node:20-alpine         | 3000  | Chat UI, activiteitenpanel           |
| NestJS backend   | node:20-alpine         | 3001  | API, RAG pipeline, tool use          |
| PostgreSQL       | postgres:16 + pgvector | 5432  | Relationele data + vector embeddings |
| Ollama           | host machine           | 11434 | Lokale embeddings                    |

## Docker Compose structuur

```yaml

services:

frontend:

build: ./frontend

ports: ["3000:3000"]

depends_on: [backend]



backend:

build: ./backend

ports: ["3001:3001"]

depends_on: [postgres]

extra_hosts:

- "host.docker.internal:host-gateway"

env_file: .env



postgres:

image: pgvector/pgvector:pg16

ports: ["5432:5432"]

volumes:

- postgres_data:/var/lib/postgresql/data

- ./init.sql:/docker-entrypoint-initdb.d/init.sql

environment:

POSTGRES_DB: activityfirst

POSTGRES_USER: postgres

POSTGRES_PASSWORD: ${DB_PASSWORD}



volumes:

postgres_data:

```

`extra_hosts: host.docker.internal:host-gateway` is nodig zodat de backend vanuit Docker de Ollama service op de hostmachine kan bereiken via `http://host.docker.internal:11434`.

## Environment variabelen

```

ANTHROPIC_API_KEY=sk-ant-...

DB_HOST=postgres

DB_PORT=5432

DB_NAME=activityfirst

DB_USER=postgres

DB_PASSWORD=...

OLLAMA_HOST=http://host.docker.internal:11434

OLLAMA_MODEL=nomic-embed-text

```

---

# Realiseren - PoC infrastructuur

**Beroepstaak:** Inrichten, testen en beschikbaar stellen van een proof of concept van een eenvoudige infrastructuur.

## Opstarten

```bash

# 1. Ollama starten op hostmachine

ollama serve

ollama pull nomic-embed-text



# 2. Stack opstarten

docker-compose up --build



# 3. Database seeden

docker-compose exec backend npm run seed:hboi

docker-compose exec backend npm run seed:canvas

```

## Testverslag

### Wat is getest

| Test                                       | Resultaat |
| ------------------------------------------ | --------- |
| Docker Compose start alle services         | Geslaagd  |
| PostgreSQL pgvector extensie actief        | Geslaagd  |
| Backend bereikt Ollama op host             | Geslaagd  |
| Embedding pipeline genereert vectors       | Geslaagd  |
| Vector search geeft relevante chunks terug | Geslaagd  |
| Chatbot genereert antwoord via Anthropic   | Geslaagd  |
| SSE streaming werkt in browser             | Geslaagd  |
| Activiteit aanmaken en ophalen via API     | Geslaagd  |

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

# Stack starten

ollama serve && docker-compose up



# Stack stoppen

docker-compose down

```

## Scenario 1: Backend start niet op

Oorzaak: meestal ontbrekende environment variabele of PostgreSQL nog niet klaar.

```bash

# Logs bekijken

docker-compose logs backend



# Controleer of alle variabelen aanwezig zijn

cat .env



# PostgreSQL status controleren

docker-compose ps postgres



# Backend opnieuw starten

docker-compose restart backend

```

## Scenario 2: Chatbot antwoordt niet

Oorzaak 1: Anthropic API key ongeldig of verlopen.

```bash

# Controleer de key

echo $ANTHROPIC_API_KEY



# Nieuwe key instellen in .env en backend herstarten

docker-compose restart backend

```

Oorzaak 2: Ollama niet bereikbaar.

```bash

# Controleer of Ollama draait op hostmachine

curl http://localhost:11434/api/tags



# Ollama opnieuw starten

ollama serve

```

## Scenario 3: Slechte chatbot-antwoorden na Canvas-update

Canvas-pagina's zijn aangepast maar de vector database bevat nog oude chunks.

```bash

# Herindexeer de Canvas-content

docker-compose exec backend npm run seed:canvas



# Controleer aantal chunks in database

docker-compose exec postgres psql -U postgres -d activityfirst \

-c "SELECT COUNT(*) FROM chunks;"

```

## Scenario 4: Database reset

Bij een corrupte database of volledige herstart.

```bash

# Volumes verwijderen en opnieuw aanmaken

docker-compose down -v

docker-compose up --build



# Opnieuw seeden

docker-compose exec backend npm run seed:hboi

docker-compose exec backend npm run seed:canvas

```

## API-sleutels beheer

- Anthropic API-sleutel staat in `.env` - nooit committen naar git

- `.env` staat in `.gitignore`

- Bij roteren van de sleutel: `.env` aanpassen en `docker-compose restart backend`

- Voor teamleden: `.env.example` bevat alle vereiste variabelen zonder waarden

## Monitoring (PoC)

Geen geautomatiseerde monitoring voor de PoC. Handmatige check via:

```bash

# Health check alle services

docker-compose ps



# Backend health endpoint

curl http://localhost:3001/health



# Database verbinding testen

docker-compose exec postgres pg_isready

```
