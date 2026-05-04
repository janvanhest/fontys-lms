# RAG PoC - Fontys Studieassistent

Bouw een lokale RAG chatbot PoC met de volgende stack:
- NestJS + TypeScript (backend)
- Vite + React + TypeScript + MUI v6 (frontend)
- PostgreSQL 16 + pgvector extensie (vector database)
- Ollama met nomic-embed-text (embeddings, lokaal, gratis, 1536 dimensies)
- Anthropic API claude-sonnet-4-5 (taalmodel)
- Docker Compose

## Doel
Een werkende RAG pipeline waarbij een gebruiker vragen kan stellen over
hardcoded Canvas-cursusinhoud. De chatbot antwoordt op basis van de
opgehaalde chunks, niet op basis van zijn trainingsdata.
Embeddings draaien volledig lokaal via Ollama - geen kosten, geen
externe afhankelijkheid voor de vectorisatie.

## Uitvoeringsstrategie
Werk dit gefaseerd uit.

De eerste verticale slice moet al end-to-end bruikbaar zijn met:
- frontend
- backend
- postgres
- keyword retrieval als basis

Voor fase 1 zijn deze onderdelen optioneel:
- Ollama embeddings
- Anthropic generatie

Gewenst gedrag voor fase 1:
- probeer vector search als embeddings beschikbaar zijn
- val anders terug op keyword search
- gebruik Anthropic alleen als `ANTHROPIC_API_KEY` beschikbaar is
- geef anders een compacte lokale response terug op basis van de beste chunks
- als er geen relevante context is, zeg dat eerlijk

## Vereisten op de host machine
Ollama is optioneel voor de eerste slice en moet lokaal draaien als vector
embeddings getest worden:
- Installeer Ollama: https://ollama.com
- Pull het embedding model: `ollama pull nomic-embed-text`
- Ollama draait op http://localhost:11434

Waarom deze stap nodig is:
- de backend gebruikt Ollama niet als chatmodel, maar als lokale embedding-provider
- `nomic-embed-text` zet tekst om naar vectors
- die vectors worden opgeslagen in PostgreSQL met pgvector
- daarna kan vector similarity search gebruikt worden om relevante chunks te vinden

Wat een embedding is:
- een embedding is een lijst getallen die de betekenis van tekst representeert
- teksten met vergelijkbare inhoud krijgen vectors die dichter bij elkaar liggen
- daardoor kun je zoeken op inhoudelijke gelijkenis, niet alleen op exacte woorden

Als Ollama of het model niet aanwezig is:
- embeddings zijn niet beschikbaar
- de applicatie valt terug op keyword retrieval
- fase 1 blijft dus nog steeds bruikbaar

## Projectstructuur
```
/
├── docker-compose.yml
├── .env
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── database/
│       │   ├── database.module.ts
│       │   └── document.entity.ts
│       ├── seed/
│       │   ├── seed.module.ts
│       │   └── seed.service.ts
│       ├── embedding/
│       │   ├── embedding.module.ts
│       │   └── embedding.service.ts
│       ├── search/
│       │   ├── search.module.ts
│       │   └── search.service.ts
│       └── chat/
│           ├── chat.module.ts
│           ├── chat.controller.ts
│           └── chat.service.ts
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.tsx
        └── main.tsx
```

## Docker Compose

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: ${DOCKER_DATABASE_URL}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      OLLAMA_URL: ${OLLAMA_URL}
      FRONTEND_URL: ${FRONTEND_URL}
      PORT: ${PORT}
    depends_on:
      - postgres
    extra_hosts:
      - "host.docker.internal:host-gateway"
    volumes:
      - ./backend/src:/app/src

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: ${VITE_API_URL}
    volumes:
      - ./frontend/src:/app/src

volumes:
  pgdata:
```

Gebruik image `pgvector/pgvector:pg16` - pgvector is al ingebouwd.
`host.docker.internal` zorgt dat de Docker container Ollama op de host
kan bereiken.

Voor fase 1 blijft Postgres verplicht, maar Ollama en Anthropic niet.

Gebruik een root `.env` bestand in `poc-rag/` voor configuratie.
Daarbij geldt:
- `DATABASE_URL` is voor lokale backend commands buiten Docker
- `DOCKER_DATABASE_URL` is voor de backend container binnen Docker Compose

Rolverdeling in deze stack:
- PostgreSQL + pgvector: opslag van chunks en embeddings, plus vector search
- Ollama + `nomic-embed-text`: genereren van embeddings
- Anthropic: genereren van natuurlijke antwoorden op basis van gevonden context

## Backend (NestJS)

### document.entity.ts
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  // pgvector kolom - 1536 dimensies voor nomic-embed-text
  @Column({ type: 'vector', length: 1536 })
  embedding: number[];

  @Column('jsonb', { nullable: true })
  metadata: { source: string; title: string; chunk_index: number };

  @CreateDateColumn()
  createdAt: Date;
}
```

### database.module.ts
TypeORM configuratie:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Document],
  synchronize: true,
})
```

Voer bij opstarten via een migration of subscriber uit:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### embedding.service.ts
Ollama heeft een OpenAI-compatibele API. Gebruik fetch rechtstreeks:
```typescript
async embed(text: string): Promise<number[]> {
  const response = await fetch(`${process.env.OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      prompt: text,
    }),
  });
  const data = await response.json();
  return data.embedding; // 1536 floats
}
```

Als Ollama niet bereikbaar is:
- log een waarschuwing
- retourneer `null`
- laat de applicatie verder gaan via keyword fallback

### seed.service.ts
Draait via OnModuleInit als de documents tabel leeg is.
Split de content hieronder per sectie in losse chunks.
Sla per chunk op: content + embedding + metadata (source, title, chunk_index).

--- CONTENT START ---

BRON: stappenplan
TITEL: Stappenplan: alles wat je nodig hebt dit semester

In Pro Open Learning bepaal jij zelf wat je wilt leren en hoe je dat doet.
Dit stappenplan helpt je om gestructureerd te starten.
Planning en begeleiding zijn essentieel voor succes.

Stap 1: Wat zijn je doelen dit semester?
Begin met het bepalen waar je aan wilt werken. Welke HBO-i competenties wil
je ontwikkelen? Welke leeruitkomsten passen bij jouw ambities?
Verken de mogelijkheden en kies je focus voor dit semester.

Stap 2: Wat heb je daarvoor nodig?
Kies een passend project of challenge die aansluit bij jouw leeruitkomsten.
Je kunt kiezen tussen een groepschallenge of individueel project.
Bij een groepschallenge werk je samen met medestudenten aan een realistische
opdracht van een externe opdrachtgever.
Bij een individueel project werk je zelfstandig aan een eigen project dat
past bij jouw ambities.

Stap 3: Hoe ga je dat dan doen?
Splits je project op in hanteerbare leeractiviteiten en zorg dat de
complexiteit past bij je niveau.
Leer hoe je een groot project opdeelt in concrete, uitvoerbare stappen.
Zorg dat je werk uitdagend is, maar niet overweldigend.

Stap 4: Hoe maak je alles inzichtelijk voor het semester?
Maak je plannen concreet en zorg voor goede documentatie.
Agile werken: werk in sprints met korte cyclussen van planning, uitvoering
en reflectie.
Leeruitkomsten in Pro Open Learning: begrijp hoe leeruitkomsten werken en
hoe je deze gebruikt om je voortgang te documenteren.
Portflow bij Fontys ICT: documenteer je werk en bewijs je competenties via
het digitale portfolio.
Persoonlijk Semesterplan: maak een concreet plan voor het hele semester
met deadlines en mijlpalen.

Tip: Wacht niet tot je alles perfect hebt uitgedacht. Begin met stap 1,
maak keuzes, en verfijn onderweg. Gebruik je coach om feedback te krijgen
en bij te sturen waar nodig.

BRON: semesterplan
TITEL: Persoonlijk Semesterplan

Een flexibel hulpmiddel om richting te geven aan je semester, inhoudelijk
en persoonlijk.

Elke semester verwachten wij dat je begint met het maken van een plan.
Dit plan geeft richting aan je semester en vormt de basis voor je
coachinggesprekken. Het is kort, bondig en flexibel: een hulpmiddel,
geen vaststaand document. Voortschrijdend inzicht kan leiden tot
aanpassingen.

Inhoud en PO: twee kanten van hetzelfde verhaal
Een competentie aantonen is meer dan een goed product opleveren. Het gaat
om hoe je werkt: hoe je communiceert, samenwerkt, feedback verwerkt en
verantwoordelijkheid neemt. Pas als inhoud en houding samen zichtbaar zijn,
toon je aan dat je een competentie beheerst.

Kernvragen voor het semesterplan:
1. Wat ga je doen? Beschrijf kort je activiteit of product en koppel dit
   aan de voor jou relevante competenties.
2. Waarom is dit relevant?
3. Hoe ga je dat doen?
4. Welke expertise heb je nodig?
5. Persoonlijke ontwikkeling: neem dit op als je vorig semester feedback
   hebt gekregen op houding, communicatie of samenwerking.

Wanneer is PO een verplicht onderdeel?
Heb je vorig semester feedback gekregen op niet-inhoudelijke zaken zoals
communicatie, aanwezigheid, samenwerking of professioneel gedrag?
Dan verwachten we dat je dit opneemt als expliciet aandachtspunt.

Gebruik per sprint:
- Controleer of het plan nog relevant is
- Vul aan of pas aan waar nodig
- Gebruik het plan in coachinggesprekken om voortgang te bespreken
- Eindreflectie: beschrijf hoe het plan richting heeft gegeven

Coachingsmomenten:
- Week 2/3: eerste bespreking met je coach
- Minimaal 2x vervolggesprekken
- Eindreflectie aan het einde van het semester

--- CONTENT END ---

### search.service.ts
```typescript
async findRelevant(embedding: number[], limit = 3): Promise<Document[]> {
  const vectorStr = `[${embedding.join(',')}]`;
  return this.dataSource.query(
    `SELECT id, content, metadata, embedding <=> $1::vector AS distance
     FROM documents
     ORDER BY distance
     LIMIT $2`,
    [vectorStr, limit],
  );
}
```

### chat.controller.ts
```typescript
// POST /api/chat
// Body: { message: string; history: { role: 'user'|'assistant'; content: string }[] }
// Response: { answer: string }
```

### chat.service.ts
```typescript
// 1. Embed de vraag via Ollama (lokaal, gratis)
const queryEmbedding = await this.embeddingService.embed(message);

// 2. Haal relevante chunks op uit pgvector
const chunks = await this.searchService.findRelevant(queryEmbedding, 3);

// 3. Bouw context
const context = chunks.map(c => c.content).join('\n\n---\n\n');

// 4. Stuur naar Claude Sonnet via Anthropic API
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  system: `Je bent een behulpzame studieassistent voor Fontys Pro Open Learning.
Beantwoord vragen uitsluitend op basis van de aangeleverde cursusinhoud.
Als het antwoord niet in de context staat, zeg dat dan eerlijk.
Antwoord altijd in het Nederlands.

Cursusinhoud:
${context}`,
  messages: [
    ...history,
    { role: 'user', content: message },
  ],
});

return { answer: response.content[0].text };
```

CORS inschakelen in main.ts voor http://localhost:3000.

## Frontend (Vite + React + TypeScript + MUI v6)

Simpele chat UI in src/App.tsx:
- MUI AppBar met titel "Fontys Studieassistent PoC"
- Gebruikersberichten rechts (primary color), assistent links (grijs)
- Input onderaan: TextField + Send knop, sticky to bottom
- Loading state: drie pulserende dots
- Gespreksgeschiedenis bijhouden in useState, meesturen bij elke call
- Welkomstbericht: "Hallo! Ik ben je studieassistent. Stel me een vraag
  over het stappenplan of het persoonlijk semesterplan."

Fetch direct naar `${import.meta.env.VITE_API_URL}/api/chat`.

## .env (root)
```
POSTGRES_DB=ragdb
POSTGRES_USER=raguser
POSTGRES_PASSWORD=ragpass

DATABASE_URL=postgresql://raguser:ragpass@localhost:5432/ragdb
DOCKER_DATABASE_URL=postgresql://raguser:ragpass@postgres:5432/ragdb

ANTHROPIC_API_KEY=sk-ant-...
OLLAMA_URL=http://host.docker.internal:11434
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3001
PORT=3001
```
Geen OpenAI key nodig - embeddings draaien lokaal via Ollama.

## Opstarten
```bash
# Stap 1: zorg dat Ollama draait met het juiste model
ollama pull nomic-embed-text
ollama serve  # als het nog niet draait

# Stap 2: start de applicatie
cp .env.example .env  # pas waarden aan indien nodig
docker-compose up --build
```

Frontend: http://localhost:3000
Backend: http://localhost:3001/api/chat

## Voorbeeldvragen om te testen
- "Wat moet ik doen in stap 1?"
- "Wanneer is PO een verplicht onderdeel van mijn semesterplan?"
- "Hoe vaak moet ik mijn coach spreken?"
- "Wat is het verschil tussen een groepschallenge en een individueel project?"
