# RAG-verkenning - Chatbot op Canvas-content

**Sprint 2 | Infrastructure - Advise - Niveau 1**
**Datum:** maart 2026

**DOT-methodes:**
- Literature study (Library): documentatie van RAG-frameworks, vector databases en embedding-modellen bestudeerd
- Available product analysis (Library): bestaande open-source tools en vergelijkbare projecten vergeleken op geschiktheid voor dit prototype


## Inleiding

In de ecosysteemanalyse is vastgesteld dat studenten moeite hebben met het vinden van informatie in Canvas. De zoekfunctionaliteit is onbetrouwbaar, waardoor studenten docenten rechtstreeks aanspreken. Dat schaalt slecht.

Ons prototype heeft een Chat-component: studenten stellen vragen over cursusinhoud, en het systeem beantwoordt die vragen zonder dat de student zelf hoeft te zoeken. RAG (Retrieval-Augmented Generation) is de techniek die dit mogelijk maakt. Dit document onderzoekt hoe RAG werkt, welke technische keuzes daarbij horen, en doet een concreet advies voor de implementatie.


## 1. Wat is RAG?

RAG combineert twee dingen: een zoekmechanisme en een taalmodel (LLM). In plaats van een LLM blind te laten antwoorden op basis van zijn trainingsdata, haalt RAG eerst relevante documenten op uit een eigen kennisbron, en geeft die mee als context aan het LLM. Het LLM genereert dan een antwoord op basis van die context.

Dit is waarom dat relevant is voor dit project:

- Canvas-content is niet in het trainingsdata van een LLM opgenomen
- Studentgegevens zijn privacygevoelig en mogen niet zomaar naar een externe API
- Het antwoord moet gebaseerd zijn op de daadwerkelijke cursusinhoud van Fontys

### De pipeline in twee fasen

**Fase 1: Indexering (eenmalig of periodiek)**

1. Canvas-content ophalen via de REST API (cursuspagina's, opdrachten, modules)
2. HTML omzetten naar platte tekst
3. Tekst opdelen in stukken van 300-500 tokens (chunking)
4. Elk stuk omzetten naar een vector via een embedding-model
5. Vectoren opslaan in een vectordatabase, met metadata (cursus-id, type, titel)

**Fase 2: Beantwoorden (bij elke vraag)**

1. Vraag van de student omzetten naar dezelfde soort vector
2. Zoeken naar de meest gelijkende stukken in de vectordatabase
3. De gevonden stukken meegeven als context aan het LLM
4. LLM genereert een antwoord op basis van die context


## 2. Technische stack

### 2.1 Vectordatabases

| Database | Setup | Persistentie | Geschikt voor |
|----------|-------|--------------|---------------|
| ChromaDB | Minimaal | Bestand of in-memory | Snel prototype, Python-native |
| Qdrant | Goed | Ingebouwd | Productierijp prototype, nette API |
| pgvector | Gemiddeld | PostgreSQL | Als je al PostgreSQL gebruikt |
| FAISS | Gemiddeld | Handmatig | Onderzoek, maximale controle |

**Advies:** Start met **ChromaDB**. Minimale configuratie, werkt direct samen met LlamaIndex en LangChain, en is geschikt voor een prototype. Als het project groeit naar een productie-omgeving, is Qdrant de logische opvolger.

### 2.2 LLM

| Optie | Kosten | Privacy/GDPR | Kwaliteit |
|-------|--------|--------------|-----------|
| OpenAI GPT-4o | Betaald (per token) | Risico: data gaat naar VS | Sterk |
| Ollama + Llama 3 (8B) | Gratis | Volledig lokaal | Goed |
| Ollama + Mistral 7B | Gratis | Volledig lokaal | Goed |

**Advies:** Gebruik **Ollama met Llama 3 (8B) of Mistral 7B** voor dit prototype. De data verlaat de eigen machine niet, wat het GDPR-risico elimineert. Ollama installeert een model met een enkel commando en werkt op een moderne laptop. Voor een publieke demo kan later eventueel worden overgestapt op een API-model.

**GDPR-toelichting:** Studentgegevens (cursusvoortgang, inleveringen, persoonlijke leerdata) vallen onder de AVG. De Nederlandse Autoriteit Persoonsgegevens heeft eind 2024 geconcludeerd dat de meeste generatieve AI-diensten nog niet volledig voldoen aan GDPR-vereisten. Lokale modellen vermijden dit probleem volledig: er gaat niets naar een externe server.

### 2.3 Embedding-model

| Model | Type | Kwaliteit | Kosten |
|-------|------|-----------|--------|
| nomic-embed-text (via Ollama) | Lokaal | Goed | Gratis |
| all-MiniLM-L6-v2 (sentence-transformers) | Lokaal | Redelijk | Gratis |
| text-embedding-3-small (OpenAI) | Cloud API | Sterk | $0,02 per miljoen tokens |

**Advies:** Gebruik **nomic-embed-text via Ollama**. Gratis, lokaal, en een sterke benchmark voor de categorie. Werkt direct samen met ChromaDB.

### 2.4 RAG-framework

| Framework | Sterkte | Eenvoud |
|-----------|---------|---------|
| LlamaIndex | Beste voor document-ingestie en RAG-workflows | Eenvoudig |
| LangChain | Flexibel, grote community | Goed |
| Haystack | Modulair, sterk voor zoekfuncties | Steiler |

**Advies:** Gebruik **LlamaIndex**. Het is specifiek ontworpen voor RAG-workflows en heeft de eenvoudigste API voor indexeren en bevragen van documenten.


## 3. Canvas-ingestie in de praktijk

Via de Canvas REST API zijn de volgende typen content op te halen:

| Endpoint | Content |
|----------|---------|
| `/api/v1/courses/:id/pages` | Cursuspagina's |
| `/api/v1/courses/:id/assignments` | Opdrachten en beschrijvingen |
| `/api/v1/courses/:id/modules` | Modules en module-items |
| `/api/v1/courses/:id/discussion_topics` | Aankondigingen |

De Python-bibliotheek `canvasapi` (UCF Open) biedt een nette wrapper om deze endpoints te benaderen zonder alle REST-aanroepen zelf te schrijven.

### Ingestie-workflow

```
1. Authenticeer via Canvas API-token (persoonlijk token voor prototype)
2. Haal per cursus op: pagina's, opdrachten, modules
3. Verwijder HTML-opmaak met BeautifulSoup
4. Chunk de tekst per item (300-500 tokens, recursive text splitter)
5. Voeg metadata toe: cursus-id, titel, type, directe Canvas-URL
6. Embed met nomic-embed-text
7. Sla op in ChromaDB
```

Metadata is essentieel: zo kun je bij het ophalen filteren op cursus, zodat een student alleen antwoorden krijgt die relevant zijn voor zijn eigen context.


## 4. Bestaande referenties

- **Canvas Course Bot (Beta)** - Instructure/MIT Sloan testten een native Canvas-chatbot (niet open source) die cursuspagina's, opdrachten en aankondigingen beantwoordt. Toont aan dat de aanpak haalbaar is.
- **canvas-lms-mcp** (GitHub: ahnopologetic/canvas-lms-mcp) - Open-source brug tussen AI-systemen en de Canvas API, inclusief cursussen, modules en opdrachten. Bruikbaar als referentie of startpunt.
- **canvas-student-data-export** (GitHub: davekats/canvas-student-data-export) - Python-script dat alle studentdata exporteert als JSON/HTML. Bruikbaar als basis voor ingestie.


## 5. Aanbevolen stack (samenvatting)

| Component | Keuze | Reden |
|-----------|-------|-------|
| Ingestie | canvasapi + BeautifulSoup | Volwassen bibliotheek, directe Canvas-koppeling |
| Chunking | LlamaIndex RecursiveCharacterTextSplitter | Respecteert zinsgrenzen |
| Embedding | nomic-embed-text (Ollama) | Lokaal, gratis, goede kwaliteit |
| Vectorstore | ChromaDB | Minimale setup, geschikt voor prototype |
| LLM | Llama 3 8B of Mistral 7B (Ollama) | Lokaal, GDPR-vriendelijk, gratis |
| Framework | LlamaIndex | Eenvoudigste API voor pure RAG |
| Interface | LTI 1.3-koppeling | Al vastgesteld als koppelingsmethode met Canvas |


## 6. Conclusie

RAG is de aangewezen techniek voor de Chat-component van ons prototype. De technische haalbaarheid is aangetoond door vergelijkbare projecten (Canvas Course Bot) en de benodigde tools zijn beschikbaar als open-source. Door te kiezen voor lokale modellen via Ollama voldoen we aan GDPR-vereisten zonder in te leveren op functionaliteit.

De volgende stap is een werkende ingestie-pipeline bouwen op basis van de eigen Canvas-testcursus, zodat de chatbot concrete vragen kan beantwoorden over cursusinhoud.


## Competentieverantwoording

**Infrastructure (Infrastructure) - Advise - Niveau 1**

In dit document geef ik een concreet advies over hoe de AI-infrastructuur voor de Chat-component van ons prototype opgezet moet worden. Ik vergelijk vectordatabases, LLM-opties, embedding-modellen en RAG-frameworks op haalbaarheid, kosten en GDPR-impact, en kom tot een specifieke aanbeveling die past bij de schaal en context van dit project. Het resultaat is een afgewogen technische richting die het team direct kan gebruiken als basis voor de implementatie in Sprint 3.
