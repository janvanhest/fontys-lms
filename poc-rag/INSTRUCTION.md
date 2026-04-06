# RAG PoC - Fontys Studieassistent

Bouw een lokale RAG chatbot PoC met de volgende stack:
- NestJS + TypeScript (backend)
- Next.js + MUI v6 (frontend)
- PostgreSQL + pgvector (vector database)
- Anthropic API / Claude Sonnet (taalmodel)
- Docker Compose (alles containers)

## Context
Dit is een proof-of-concept voor een studentgericht leerplatform bij Fontys.
De chatbot moet vragen kunnen beantwoorden op basis van cursusinhoud uit Canvas.
Voor deze PoC gebruiken we hardcoded content: twee pagina's uit de Canvas cursus.

## Projectstructuur
Maak een monorepo:
```
/
├── docker-compose.yml
├── backend/          (NestJS)
└── frontend/         (Next.js)
```

## Docker Compose
Drie services:
- postgres (postgres:16 met pgvector extensie)
- backend (NestJS op poort 3001)
- frontend (Next.js op poort 3000)

Postgres environment:
```
POSTGRES_DB: ragdb
POSTGRES_USER: raguser
POSTGRES_PASSWORD: ragpass
```

## Backend (NestJS)

### Modules
1. DatabaseModule - TypeORM met pgvector
2. EmbeddingModule - chunking + embeddings via Anthropic
3. SearchModule - vector similarity search
4. ChatModule - RAG pipeline + Claude

### Database schema
Tabel: documents
- id (uuid)
- content (text)
- embedding (vector(1536))
- metadata (jsonb) - bron, titel, chunk_index
- created_at

### Seeding
Seed script draait automatisch bij opstarten als tabel leeg is.
Split de content per sectie/stap in losse chunks.

--- CONTENT START ---

PAGINA 1: Stappenplan

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

PAGINA 2: Persoonlijk Semesterplan

Een flexibel hulpmiddel om richting te geven aan je semester, inhoudelijk
én persoonlijk.

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
2. Waarom is dit relevant? Licht toe waarom dit bijdraagt aan het aantonen
   van de gekozen competenties en waarom dit belangrijk is binnen de
   challenge.
3. Hoe ga je dat doen? Beschrijf in hoofdlijnen je aanpak, stappen en
   middelen.
4. Welke expertise heb je nodig? Geef aan bij welke expertises je feedback,
   validatie of kennis gaat ophalen, bijvoorbeeld via experttafels.
5. Persoonlijke ontwikkeling: neem dit op als je vorig semester feedback
   hebt gekregen op houding, communicatie of samenwerking, of als je zelf
   merkt dat bepaalde vaardigheden je belemmeren.

Wanneer is PO een verplicht onderdeel?
Heb je vorig semester feedback gekregen op niet-inhoudelijke zaken zoals
communicatie, aanwezigheid, feedback geven of ontvangen, samenwerking of
professioneel gedrag? Dan verwachten we dat je dit opneemt als expliciet
aandachtspunt in je semesterplan.

Gebruik per sprint:
- Controleer of het plan nog relevant is
- Vul aan of pas aan waar nodig
- Gebruik het plan in coachinggesprekken om voortgang te bespreken
- Eindreflectie: beschrijf hoe het plan richting heeft gegeven

Coachingsmomenten:
- Week 2/3: eerste bespreking met je coach
- Minimaal 2x vervolggesprekken: plan gebruiken en bijstellen
- Eindreflectie: hoe gaf het plan richting en welke aanpassingen heb je gedaan?

Richtlijnen:
- Kort en bondig, streven is ongeveer 1 tot 2 A4
- Richtinggevend, niet dogmatisch
- Actief gebruiken in gesprekken
- Helpt bij het maken van keuzes en benutten van expertise

--- CONTENT END ---

### Embeddings
Gebruik Anthropic API voor embeddings: model "voyage-3".
Fallback: als dat niet werkt gebruik OpenAI text-embedding-3-small.
Als geen van beide werkt: simpele keyword-based search als tijdelijke
oplossing zodat de app altijd draait.

### RAG Pipeline (ChatService)
POST /api/chat
Body: { message: string, history: { role: 'user'|'assistant', content: string }[] }

Flow:
1. Embed de vraag van de gebruiker
2. Zoek de 3 meest relevante chunks via cosine similarity in pgvector
3. Bouw een system prompt:
   "Je bent een behulpzame studieassistent voor Fontys Pro Open Learning.
    Beantwoord vragen op basis van de aangeleverde cursusinhoud.
    Als het antwoord niet in de context staat, zeg dat dan eerlijk.
    Antwoord altijd in het Nederlands."
4. Stuur context + gespreksgeschiedenis + vraag naar Claude Sonnet
5. Retourneer het antwoord

### Environment variables backend
```
ANTHROPIC_API_KEY=
DATABASE_URL=postgresql://raguser:ragpass@postgres:5432/ragdb
```

## Frontend (Next.js + MUI v6)

Simpele chat UI:
- Centered layout, max-width 800px
- MUI AppBar bovenaan met titel "Fontys Studieassistent PoC"
- Chat history: berichten van gebruiker rechts (primary color),
  assistent links (grey), met avatar icoon
- Input onderaan: TextField + Send knop, fixed to bottom
- Loading state: typing indicator (drie pulserende dots)
- Welkomstbericht bij opstarten:
  "Hallo! Ik ben je studieassistent. Stel me een vraag over het
   stappenplan, je semesterplan of hoe Pro Open Learning werkt."

Environment variables frontend:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Belangrijke details
- TypeScript strict mode overal
- NestJS: ConfigModule voor environment variables
- pgvector extensie initialiseren via migration of init script
- Seed alleen draaien als documents tabel leeg is (idempotent)
- CORS instellen in NestJS
- Hot reload voor beide services in Docker via volumes
- README.md met opstartinstructies: `docker-compose up --build`
