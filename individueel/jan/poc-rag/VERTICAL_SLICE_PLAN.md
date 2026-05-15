# Verticale Slice Plan

## Doel
Eerst een kleine, werkende end-to-end versie bouwen van de Fontys studieassistent.

Met "verticale slice" bedoelen we hier:
- frontend chat werkt
- backend `POST /api/chat` werkt
- de backend zoekt relevante stukken in de Canvas-content
- de backend geeft een antwoord terug op basis van die content

Nog niet het doel in deze slice:
- perfecte retrieval
- productieklare architectuur
- uitgebreide observability
- volledige vector search als enige zoekmethode

De kernvraag voor deze slice is:

> Kan een gebruiker een vraag stellen over de meegeleverde Canvas-inhoud en een bruikbaar antwoord terugkrijgen via de hele stack?

---

## Wat staat er nu al?

Er staat al meer dan alleen een instructiedocument. In de huidige repo matcht dit al deels met de slice:

### Frontend
- In [App.tsx](/Users/jhhest/school/fontys-lms/poc-rag/frontend/src/App.tsx) staat een simpele chat-UI.
- De frontend stuurt al een request naar `POST /api/chat`.
- De frontend toont berichten, loading state en foutmeldingen.

### Backend
- In [chat.controller.ts](/Users/jhhest/school/fontys-lms/poc-rag/backend/src/chat/chat.controller.ts) bestaat `POST /api/chat`.
- In [chat.service.ts](/Users/jhhest/school/fontys-lms/poc-rag/backend/src/chat/chat.service.ts) wordt al context opgehaald via `SearchService`.
- In [search.service.ts](/Users/jhhest/school/fontys-lms/poc-rag/backend/src/search/search.service.ts) zit al een combinatie van vector search en keyword fallback.
- In [course-content.ts](/Users/jhhest/school/fontys-lms/poc-rag/backend/src/database/course-content.ts) staat de hardcoded Canvas-content al opgesplitst in chunks.
- In [database-seeder.service.ts](/Users/jhhest/school/fontys-lms/poc-rag/backend/src/database/database-seeder.service.ts) wordt die content al in de database gezet.

### Conclusie
De repo zit al voorbij "idee-fase". Er is al een eerste slice opgezet, maar die is nog te ambitieus ingestoken omdat embeddings, database, vector search en LLM-aanroep meteen allemaal tegelijk meedoen.

De verstandigste stap is daarom niet "meer bouwen", maar:

1. de slice expliciet klein maken
2. de afhankelijkheden reduceren
3. daarna pas de complexiteit terug toevoegen

---

## Aanbevolen aanpak in fases

## Fase 1: Werkende slice zonder embeddings als harde afhankelijkheid

### Doel
Een gebruiker kan een vraag stellen en een antwoord krijgen op basis van de twee Canvas-pagina's, zonder dat Ollama of pgvector vereist zijn om de flow bruikbaar te maken.

### Wat moet deze fase kunnen?
- frontend kan vragen sturen
- backend accepteert `POST /api/chat`
- backend haalt relevante chunks op
- backend gebruikt minimaal keyword search als betrouwbare fallback
- backend geeft altijd een antwoord terug

### Wat hoort er technisch in?
- behoud van de huidige frontend-chat
- behoud van de huidige `POST /api/chat`
- behoud van hardcoded seed-content
- keyword-based retrieval moet zelfstandig werken, ook als embeddings falen
- een gecontroleerde fallback in `ChatService` als Anthropic niet beschikbaar is

### Belangrijkste aanpassing ten opzichte van nu
De slice moet ook werken als deze onderdelen ontbreken of stuk zijn:
- `ANTHROPIC_API_KEY`
- Ollama
- vector embeddings

Nu is dat nog niet scherp genoeg afgedwongen in de serviceflow.

### Wat matcht al?
- frontend is al bruikbaar
- `course-content.ts` is al aanwezig
- `search.service.ts` heeft al keyword fallback
- de controller-route bestaat al

### Wat ontbreekt nog?
- `ChatService` lijkt nu direct een Anthropic client aan te maken en altijd een modelcall te willen doen
- er is nog geen expliciete "geen LLM beschikbaar" fallback-antwoordstrategie
- de slice is conceptueel nog afhankelijk van te veel infra tegelijk

### Definition of done
- zonder Ollama moet de app nog steeds een antwoord kunnen geven
- zonder `ANTHROPIC_API_KEY` moet de app nog steeds een antwoord kunnen geven
- de antwoorden zijn gebaseerd op de gevonden Canvas-chunks
- de gebruiker kan de flow end-to-end testen via frontend -> backend -> response

---

## Fase 2: Retrieval stabiliseren en transparant maken

### Doel
Zorgen dat de zoeklogica voorspelbaar genoeg is voor de PoC en dat duidelijk is waarom een antwoord gegeven wordt.

### Wat moet deze fase kunnen?
- relevante chunks kiezen op een manier die uitlegbaar is
- geen "magische" afhankelijkheid van embeddings voor basisfunctionaliteit
- optioneel context teruggeven voor debuggen of inspectie

### Wat hoort er technisch in?
- keyword scoring verder aanscherpen als nodig
- chunkgrenzen controleren op bruikbaarheid
- eventueel bron- en titelinformatie meesturen vanuit `ChatService`
- nette handling voor "geen relevante context gevonden"

### Wat matcht al?
- `SearchService` retourneert al `content`, `metadata` en `score`
- de content is al opgesplitst in betekenisvolle brokken

### Waarschijnlijk nuttige verbeteringen
- minimumscore of lege-resultaat-afhandeling
- voorkomen dat irrelevante chunks toch naar de prompt gaan
- antwoordtekst laten zeggen dat iets niet in de cursusinhoud staat als er onvoldoende context is

### Definition of done
- zoekresultaten zijn voldoende stabiel voor demo-vragen
- backend kan eerlijk reageren als iets niet in de context staat
- gedrag is reproduceerbaar zonder afhankelijk te zijn van embeddings

---

## Fase 3: LLM-laag gecontroleerd toevoegen

### Doel
Pas nadat retrieval werkt, de antwoordgeneratie via Anthropic netjes inzetten.

### Wat moet deze fase kunnen?
- gevonden context meegeven aan Anthropic
- gesprekshistorie meenemen
- fallback houden als Anthropic niet beschikbaar is

### Wat hoort er technisch in?
- `ChatService` splitst retrieval en generatie duidelijk van elkaar
- als `ANTHROPIC_API_KEY` ontbreekt:
  - geef een eenvoudige, lokale samenvattende response terug op basis van context
- als context leeg is:
  - antwoord eerlijk dat het niet in de cursusinhoud staat

### Wat matcht al?
- promptopbouw staat al in `chat.service.ts`
- history DTO bestaat al

### Wat moet beter?
- externe modelcall moet optioneel zijn, niet verplicht
- foutafhandeling rond Anthropic moet de chatflow niet breken

### Definition of done
- met geldige key krijg je een nette modelgegenereerde response
- zonder key blijft de PoC bruikbaar
- de PoC crasht niet op ontbrekende externe services

---

## Fase 4: Database en seed als infrastructuurlaag hard maken

### Doel
De data-opslag en seed-flow betrouwbaar maken, zonder dat dit de basis-slice blokkeert.

### Wat moet deze fase kunnen?
- documents tabel correct vullen
- seed idempotent uitvoeren
- applicatie-start voorspelbaar maken

### Wat hoort er technisch in?
- controle van `document.entity.ts`
- bevestigen dat pgvector extensie correct wordt geïnitialiseerd
- seed alleen draaien als tabel leeg is
- duidelijke foutmelding als database ontbreekt

### Wat matcht al?
- entity bestaat
- seeder bestaat
- Docker Compose bevat postgres
- init script voor postgres bestaat al in `postgres/init/01-init.sql`

### Belangrijk aandachtspunt
Voor de verticale slice is dit ondersteunende infrastructuur, niet de eerste bron van waarde. Dus eerst de applicatieflow valideren, daarna pas deze laag perfectioneren.

### Definition of done
- database start voorspelbaar op
- seed loopt één keer
- documenten zijn zichtbaar en bruikbaar voor search

---

## Fase 5: Echte embeddings en vector search als kwaliteitsverbetering

### Doel
De retrievalkwaliteit verbeteren nadat de slice al werkt.

### Wat moet deze fase kunnen?
- embeddings genereren via Ollama
- embeddings opslaan in pgvector
- vector similarity search gebruiken als primaire route
- keyword search behouden als fallback

### Wat hoort er technisch in?
- `EmbeddingService` robuust maken
- `SearchService` vector-resultaten valideren
- fallback naar keyword search behouden

### Wat matcht al?
- embedding module bestaat
- search service bevat al vector + keyword flow
- Docker Compose bevat koppeling naar `host.docker.internal`

### Definition of done
- met draaiende Ollama gebruikt de app vector search
- zonder Ollama blijft de app werken via keyword search
- retrievalkwaliteit verbetert zonder functionele regressie

---

## Aanbevolen eerstvolgende stap

De meest logische stap is:

## Nu focussen op Fase 1

Waarom:
- de frontend staat er al
- de backend route staat er al
- de hardcoded content staat er al
- de keyword fallback staat er al deels

Dat betekent dat Fase 1 vooral gaat over:
- afhankelijkheden loskoppelen
- fallback gedrag expliciet maken
- de flow betrouwbaar demo-baar maken

Praktisch is dit dus geen greenfield werk meer, maar een versimpeling van wat er al staat.

---

## Concreet voorstel voor Fase 1 implementatie

Als we Fase 1 nu zouden uitvoeren, dan zou de scope zijn:

1. frontend ongemoeid laten, behalve kleine fixes
2. `ChatService` zo aanpassen dat Anthropic optioneel wordt
3. keyword retrieval als gegarandeerde basis laten werken
4. bij ontbrekende context een eerlijke response teruggeven
5. end-to-end testen met een paar vaste vragen

Voorbeelden van testvragen:
- "Wat moet er in een semesterplan staan?"
- "Wanneer is PO verplicht?"
- "Wat doe je in stap 2 van het stappenplan?"
- "Hoe vaak heb je coachinggesprekken?"
- "Wat zegt de cursus over onderwerpen buiten deze content?"

---

## Samenvatting

De huidige repo past al deels bij een verticale slice, maar probeert meteen te veel tegelijk:
- database
- pgvector
- embeddings
- LLM
- fallback

De verstandigste route is:

1. eerst de slice betrouwbaar maken zonder harde afhankelijkheid op embeddings of Anthropic
2. daarna retrievalkwaliteit verbeteren
3. daarna pas de infrastructuur en vector search verder uitbouwen

Kort gezegd:

> Niet eerst slimmer maken. Eerst werkend en robuust maken.
