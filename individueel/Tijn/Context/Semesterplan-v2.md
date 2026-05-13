# Semesterplan

*Project: Bouw je eigen Learning Management System (LMS)*
*Auteur: Tijn Knapen | semester 4*
*Datum: Maart 2026, bijgewerkt mei 2026*
*Stakeholder: Eric Slaats*
*Coaches: Lennart, Coen, Robin*
*Infra-assessor: Marc*

## Versiebeheer

| Versie | Datum | Auteur | Wijzigingen |
| ----: | :---- | :---- | :---- |
| 1 | 10-03-2026 | Tijn Knapen | Semesterplan |
| 2 | 17-03-2026 | Tijn Knapen | Feedback verwerkt: User Interaction als architectuurlaag, keuze infrastructuur verduidelijkt, vroeg realiseren benadrukt |
| 3 | 12-05-2026 | Tijn Knapen | Bijgewerkt na sprint 2: modelhistorie Qwen 2.5 14B naar Claude API, Docker compose lokaal in plaats van eigen VPS, rolverdeling infra met Jan, sprint 3 plan aangescherpt op basis van iteratie 3 (NestJS + function calling) en iteratie 4 (RAG met pgvector) |

## 1. Wat ga ik doen?

*Hoe maak je de leerervaring in Canvas beter door de focus te verleggen van modules naar de student en zijn activiteiten, zodat vraaggestuurd onderwijs soepel loopt met minimale hindernissen?*

We bouwen geen compleet nieuw LMS vanaf nul, maar focussen op een werkend prototype als aanvulling of verbetering via Canvas API en LTI-koppelingen. Eerst doen we onderzoek en ideation om pijnpunten scherp te krijgen bij echte gebruikers (studenten en docenten), daarna komen ontwerp en bouw. Dit past bij de challenge-omschrijving: een realistisch alternatief of aanvulling op Canvas bouwen, met focus op schaalbaarheid, veiligheid en gebruiksgemak.

### 1.1 Competenties:

| Architectuurlaag | Niveau | Activiteiten |
| :---- | :---- | :---- |
| User Interaction (secundair) | 1 | Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control |
| Infrastructuur (Primair) | 1 | Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control |
| Software | 2 | Analyseren, Adviseren, Ontwerpen, Realiseren, Manage & Control |

Ik kies primair voor Infrastructuur niveau 1, omdat infra goed past bij de leervraag: we bouwen een prototype dat draait op een eigen server, koppelt met Canvas via LTI en de REST API, en schaalbaar en veilig moet zijn. User Interaction is een secundaire keuze die aansluit op de UX-kant van het prototype.

**Professional skills**: Ik werk aan Persoonlijk leiderschap en Professionele standaard, gericht op de groei van niveau 2 naar niveau 3.

## 2. Waarom is dit relevant?

**User Interaction niveau 1** is passend, omdat de challenge breed en open is: individuele problemen onder docenten en studenten met slechte UX in Portflow zijn echt. Ik moet zelf uitzoeken wat gebruikers nodig hebben via analyseren. Een verbeterde UX moet de leerervaring binnen Canvas verbeteren.

**Infrastructuur niveau 1** is ook relevant, omdat een LMS veel technische basis vraagt die betrouwbaar en schaalbaar moet zijn. Denk aan veilige opslag en toegang tot leerdata voor veel gebruikers tegelijk, goede koppelingen met bestaande systemen zoals Canvas via API of LTI, beheer van rollen en rechten, en misschien basis monitoring of deployment om het prototype stabiel te houden.

## 3. Hoe ga ik dat doen?

### 3.1 Sprint 1: Analyseren (tot 17 maart) - AFGEROND

Het probleem en de technische context in kaart brengen.

* **Infrastructuur analyse:** Uitzoeken hoe de huidige LTI-koppelingen en API's van Canvas werken. Ik verdiep me in hoe we data uit verschillende systemen veilig en betrouwbaar kunnen koppelen, zodat we het persoonlijke leerproces van de student beter centraal kunnen stellen.
* **Benchmarkonderzoek:** Kijken naar andere leerplatforms en tools. Ik wil uitzoeken hoe zij studentgericht leren aanpakken en wat we van hun gebruiksvriendelijkheid kunnen afkijken.
* **Eisen opstellen (Requirements):** Een eerste lijst maken van wat ons prototype minimaal moet kunnen. Hierin neem ik zowel de wensen voor de interface (User Interaction) als de technische randvoorwaarden zoals veiligheid en schaalbaarheid (Infrastructuur) mee.
* **Eerste prototype-stappen:** Al in sprint 1 start ik met een eerste technische opzet, zodat er vroeg iets werkends is om op voort te bouwen. Dit maakt de analyses concreter en geeft het team eerder iets om op te reageren.

### 3.2 Sprint 2: Analyseren afronden, Adviseren en Ontwerpen (tot 19 april) - AFGEROND

Mijn onderzoek vertalen naar concrete keuzes, eerste schetsen en een tastbaar prototype.

* **Iteratie 1 chatbot prototype (Python + Ollama):** Lokaal Qwen 2.5 14B via Ollama, GDPR-safe en zonder externe API. Twee-laagse system prompt (competentiedefinities + studentprofiel uit mock JSON) en drie use cases getest: voortgang met advies, planning opvragen, document koppelen aan competentie. Gestart met Llama 3.1 8B, afgekeurd na hallucinaties, geswitcht naar Qwen 2.5 14B.
* **Iteratie 2 chatbot prototype (PostgreSQL in Docker):** Mock JSON vervangen door PostgreSQL 16 in een eigen Docker container, schema met 4 tabellen (student, competentie, voortgang, activiteit), psycopg v3 zonder ORM. Loader-module levert dezelfde dict-structuur als iteratie 1 zodat geen regressie optreedt. Seed-script met drie fictieve studenten en per-student testvragen.
* **Architectuurontwerp (C4 & ADR's):** C4-diagrammen level 1 tot 3 getekend om visueel in kaart te brengen hoe ons systeem communiceert met de Canvas API en LTI. Eerste ADR's vastgelegd voor LTI 1.3, Canvas REST API en testomgeving.
* **Adviesrapport:** Geschreven aan Bijlage B (prototype iteratie 1 en 2, modelkeuze, testresultaten) en Bijlage E sectie 7 (lokale LLM en Modal.com als vervolgonderzoek). Strategie chatbot herzien op feedback van Lennart: componentstructuur, scheiding tussen context en orchestratie.
* **Gebruikersonderzoek:** Interview met semester 6 avondstudent om de student-kant van vraaggestuurd onderwijs te valideren.
* **Afstemmen met team en stakeholder:** FeedPuls-meeting 9 april met de groep, scope-afspraken gemaakt over wat we zelf bouwen en wat we via Canvas-koppeling hergebruiken.

### 3.3 Sprint 3: Ontwerpen en Realiseren (tot 24 mei)

Van ontwerp naar een werkend prototype (Proof of Concept) op productie-pad. Modelkeuze in mei verlegd van lokaal Qwen 2.5 14B naar **Claude API** (groepsbesluit, Modal.com vervolgonderzoek daarmee obsolete). De Python-prototypes uit sprint 2 worden vervangen door een **NestJS backend** met Postgres + pgvector in Docker compose.

* **Iteratie 3, NestJS + Claude API + function calling:** Backend in NestJS opgezet met pnpm, Postgres 16 + pgvector in dezelfde compose. `@anthropic-ai/sdk` integreren, eerste `POST /api/chat` endpoint, tool definities voor lezen (`get_student_progress`, `get_activities`, `get_competentie`). Doel: kan Claude betrouwbaar functies aanroepen in plaats van eager-loaded context? Lost dit de scope drift en boundary-interpretatie uit iteratie 2 op?
* **Iteratie 4, RAG met pgvector:** Embedding pipeline van competentiedefinities en projectbeschrijvingen, `search_context(query, top_k)` als tool. Doel: kan RAG betere antwoorden geven door alleen relevante context op te halen in plaats van alles vooraf in te laden?
* **Infrastructure niveau 1 deliverables (assessment Marc):** Vijf HBO-i activiteiten op niveau 1 invullen, te bewijzen later deze sprint bij Marc:
  * Analyse: modelkeuze, Postgres vs alternatieven, Docker vs directe install, optioneel NestJS-keuze
  * Advies: lokaal model + promptopzet, Postgres + Docker + psycopg, optioneel shared (Neon) vs lokaal
  * Ontwerp: schema 4 tabellen, high-level diagram (backend + postgres + Claude API + frontend), low-level diagram (NestJS-modules + schema-detail + compose-netwerk)
  * Realisatie: PostgreSQL + pgvector container draait, NestJS backend container met Dockerfile, compose-snippet die backend + postgres samen start
  * Manage & Control: reset-procedure Postgres compose, installatiehandleiding voor backend + postgres, kort stappenplan beheer/deployment
* **Rolverdeling infra met Jan:** Tijn niveau 1 op de voorspelbare basis (eigen 2 services in compose, installatiehandleiding, 2 diagrammen). Jan niveau 2 op de lastige stukken: root compose-integratie, netwerk en healthchecks, productie-deploy (Neon of VPS), CI/CD, monitoring, cross-service debugging. Neon valt buiten mijn scope, ik beargumenteer het wel als advies maar bouw het niet zelf.
* **Canvas-koppeling voorbereiden:** Developer Key aanvragen bij Fontys Canvas-beheerder, testomgeving regelen. Concrete implementatie van API/LTI volgt zodra de chatbot-backend stabiel draait.
* **Afstemming backend-team:** Databasevoorstel uit `sprint3/db-ontwerp.md` met teamgenoten afstemmen tot een definitief ontwerp.

### 3.4 Sprint 4: Realiseren + Manage & Control (tot 23 juni)

Afronden, stabiliseren en alles netjes en overdraagbaar opleveren. Plan wordt aan het einde van sprint 3 aangescherpt op basis van de stand van zaken na de Marc-assessment en het werkende PoC.

* **CI/CD en Kwaliteitsborging:** Pipeline inrichten voor automatische deployment en integratietesten.
* **Stabiliteit en Veiligheid:** Achterkant van het PoC bijsturen op basis van testresultaten, infrastructuur en Canvas-koppeling controleren op veiligheid en schaalbaarheid.
* **Documentatie en Overdracht:** Architectuurdocumentatie finaliseren (C4 + ADR's), infrastructuur-documentatie en code netjes op git.fhict.nl plaatsen.
* **Portfolio:** Eigen documenten en reflecties schrijven om aan te tonen dat Infrastructuur niveau 1 (en richting niveau 2) is behaald.

## 4. Welke expertise heb ik nodig?

Om dit project te laten slagen en mijn doelen voor User Interaction en Infrastructuur te halen, moet ik me in de volgende zaken verdiepen:

| Expertisegebied | Waarvoor | Hoe |
| :---- | :---- | :---- |
| UX en Gebruikersonderzoek (User Interaction) | Het maken van paper prototypes, wireframes en het uitvoeren van usability testen om de leerervaring studentgerichter te maken. | Feedback van design docenten, experttafels. |
| Infrastructuur en Hosting | Het opzetten van een Docker compose stack met NestJS backend en Postgres + pgvector, en zorgen dat de applicatie kan praten met Canvas via LTI en de API. | Experttafels, feedback van infra docenten (Marc), samenwerking met Jan voor productie-deploy. |
| Claude API en function calling | Backend integreren met Claude via `@anthropic-ai/sdk`, tools definiëren waarmee het model data uit Postgres kan ophalen in plaats van eager-loaded context. | Anthropic documentatie, eigen iteraties, code review met Jan. |
| Domeinexpertise Onderwijs | Begrijpen wat studenten precies nodig hebben om hun eigen leerpad uit te stippelen en hoe vraaggestuurd onderwijs in de praktijk werkt. | Gesprekken voeren met stakeholder Eric Slaats, onze coaches en studenten. |

## 5. Persoonlijke ontwikkeling

Voor mijn Professional skills werk ik dit semester van niveau 2 naar niveau 3. Mijn specifieke leerdoelen voor dit project zijn:

* **Werk tijdig laten zien**: Ik heb de neiging om heel zelfstandig te werken en pas iets te delen met de groep als ik denk dat het helemaal af is. Dit semester dwing ik mezelf om ruwe schetsen, vroege ontwerpen of opzetjes veel sneller te delen met mijn teamgenoten en de stakeholder.
* **Structureel feedback ophalen**: Aantoonbare feedback is een harde eis om dit semester te halen. Daarom dwing ik mezelf om regelmatig en op tijd feedback te vragen aan mijn coaches, in plaats van alles zelf te willen uitzoeken.
* **Communicatie verbeteren**: Door mijn voortgang en keuzes vaker te bespreken, voorkom ik dat ik te lang in mijn eigen bubbel blijf hangen. Zo weet ik zeker dat mijn werk voldoet aan de eisen voor de eindbeoordeling.
