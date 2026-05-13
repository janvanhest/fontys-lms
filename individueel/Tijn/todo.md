# Todo - Sprint overzicht

## Sprint 1: Analyseren (deadline 17 maart) - AFGEROND

- [x] **Canvas API & LTI technische verkenning** *(document: `canvas-api-lti-verkenning.md`)*
  *Competenties: Infrastructuur – Analyseren – Niveau 1*
  > Openstaand (niet sprint-gebonden): Developer Key aanvragen bij Fontys Canvas-beheerder + testomgeving regelen.

- [x] **Libraries & tooling overzicht** *(verwerkt in `canvas-api-lti-verkenning.md`)*

- [x] **Ecosysteemanalyse** *(document: `ecosysteemanalyse.md`)*
  *Competenties: Infrastructuur – Analyseren – Niveau 1*

- [x] **Sprint 1 reflectie** *(document: `reflectie-sprint1.md`)*
  *Competenties: PL-2, PS-2*

- [x] **Versiebeheer opgezet** *(document: `versiebeheer.md`)*
  *Competenties: Infrastructuur – Manage & Control – Niveau 1*

- [x] **Feedback-log aangemaakt** *(document: `feedback-log.md`)*
  *Competenties: PS-2*

- [x] **Semesterplan omgezet naar markdown + feedback verwerkt** *(Context/Semesterplan.md)*

- [x] **Challenge voorstel feedback verwerkt** *(Context/Challenge voorstel.md)*
  Stakeholderinzichten verwerkt, scope aangepast naar LTI-prototype, grading bottleneck verwijderd.

---

## Sprint 2: Adviseren + start Ontwerpen (deadline 19 april) - AFGEROND

### Iteratie 1 (afgerond 3 april 2026)
- [x] **Strategie chatbot herzien** - feedback Lennart verwerkt, structuur via componenten, context-architectuur toegevoegd *(sprint2/strategie-chatbot.md)*
- [x] **Iteratie 1 onderzoeksdocument** *(sprint2/iteratie1-1-onderzoek.md)*
- [x] **Chatbot scope document** *(Context/chatbot-scope.md)*
- [x] **Iteratie 1 prototype** - Python + Ollama (Qwen 2.5 14B), mock JSON, drie use cases getest *(sprint2/iteratie1-2-prototype/)*
- [x] **Iteratie 1 conclusie** *(sprint2/iteratie1-3-conclusie.md)*

### Iteratie 2 (afgerond 20 april 2026)
- [x] **Iteratie 2 onderzoeksdocument** *(sprint2/iteratie2-1-onderzoek.md)*
- [x] **Iteratie 2 prototype** - PostgreSQL 16 in Docker, schema met vier tabellen, loader-module, per-student testvragen *(sprint2/iteratie2-2-prototype/)*
- [x] **Iteratie 2 conclusie** *(sprint2/iteratie2-3-conclusie.md)*
  *Competenties: Infrastructure - Realise, Analyse & Advise - Niveau 1*

### Documentatie en teambijdragen
- [x] **C4-diagrammen (level 1-3)**
- [x] **Gebruikersonderzoek avondstudent** *(sprint2/Samenvatting interview semester 6 student.md)*
- [x] **Adviesrapport Bijlage B** - prototype iteratie 1 en 2, modelkeuze, testresultaten
- [x] **Adviesrapport Bijlage E sectie 7** - lokale LLM en Modal.com vervolgonderzoek
- [x] **FeedPuls groepsmeeting** *(sprint2/feedpuls-groep-09april.md)*
- [x] **Versiebeheer bijgewerkt naar v0.3** - Docker, PostgreSQL 16, psycopg v3 gedocumenteerd
  *Competenties: Infrastructure - Manage & Control - Niveau 1*
- [x] **Sprint 2 reflectie** *(sprint2/reflectie-sprint2.md)*
  *Competenties: PL-2, PS-2*

---

## Sprint 3: Ontwerpen + Realiseren (deadline 24 mei)

- [x] **Databasevoorstel eindbeeld** *(sprint3/db-ontwerp.md)* - eigen chatbot-deel uitgewerkt, rest als aanname, als gespreksbasis voor backend-team
  *Competenties: Infrastructure - Design & Advise - Niveau 1*

### Infrastructure niveau 1 deliverables (assessment Marc)

Hard te bewijzen later deze sprint bij Marc. Vijf HBO-i activiteiten op niv 1, gebaseerd op `sprint3/lijstje-POC.md` regels 281-314.

**Fallback-aanpak (buiten GitHub om):** Als PR #5 te lang op review wacht of zwaar verandert, kan ik de Realise + M&C deliverables lokaal dubbel opbouwen (eigen map of lokale branch, niet pushen). Zo kan ik Marc tonen wat ik gebouwd heb zonder Jan te hinderen of afhankelijk te zijn van zijn review-tempo. Concreet kopie te maken:
- [ ] Eigen Dockerfile NestJS (kopie van PR #5)
- [ ] Eigen Postgres+pgvector container met init.sql
- [ ] Eigen minimale compose-snippet die die twee samen start
- [ ] Lokaal getest, screenshots/logs bewaren als bewijs

**Analyse-I1**
- [x] Modelkeuze, hardware-analyse, context window *(sprint2/iteratie1-1-onderzoek.md)*
- [x] Postgres vs alternatieven, Docker vs directe install, psycopg vs ORM *(sprint2/iteratie2-1-onderzoek.md)*
- [ ] Korte analyse waarom NestJS als backend-framework (optioneel maar nuttig voor compleetheid)

**Advise-I1**
- [x] Lokaal model + twee-laagse promptopzet *(sprint2/iteratie1-1-onderzoek.md)*
- [x] Postgres + Docker + psycopg + plat SQL *(sprint2/iteratie2-1-onderzoek.md)*
- [ ] Advies shared (Neon) vs lokaal, ook al bouw ik Neon zelf niet

**Design-I1**
- [x] Schema 4 tabellen, loader-flow, testopzet *(sprint2/iteratie2-1-onderzoek.md)*
- [ ] High-level diagram (backend + postgres + Claude API + frontend)
- [ ] Low-level diagram (NestJS-modules, schema-detail, compose-netwerk)

**Realise-I1**
- [x] PostgreSQL + pgvector container draait, schema seed, loader *(sprint2/iteratie2-3-conclusie.md)*
- [x] NestJS backend container met Dockerfile *(PR #5, wacht op review Jan)*
- [x] Compose-snippet backend + postgres samen *(PR #5, wacht op review Jan)*

**Manage & Control-I1**
- [x] Modelwissel Llama naar Qwen beheerd op kwaliteitscriteria *(sprint2/iteratie1-3-conclusie.md)*
- [x] Reset-procedure Postgres compose *(sprint2/iteratie2-3-conclusie.md)*
- [ ] Installatiehandleiding voor backend + postgres compose
- [ ] Kort stappenplan beheer/deployment

### Iteratie 3: NestJS + Claude API + function calling
- [x] NestJS scaffold + Postgres+pgvector in Docker *(PR #5)*
- [ ] `@anthropic-ai/sdk` toevoegen + `.env` met `ANTHROPIC_API_KEY`
- [ ] ORM-keuze (TypeORM vs Prisma) afstemmen met Jan
- [ ] NestJS aan Postgres koppelen + eerste `Student` entity + seed data
- [ ] `POST /api/chat` endpoint met Claude API
- [ ] Eerste tool definitie (bv. `get_student_progress`)
- [ ] Frontend chat UI tegen `/api/chat`
- [ ] Iteratie 3 onderzoek - kan Claude betrouwbaar functies aanroepen in plaats van eager-loaded context?
- [ ] Iteratie 3 conclusie - lost function calling de scope drift (scenario 1) en boundary-interpretatie (scenario 4) uit iteratie 2 op?

### Iteratie 4: RAG met pgvector
- [ ] Iteratie 4 onderzoek - kan RAG via pgvector betere antwoorden geven door alleen relevante context op te halen?
- [ ] Embedding pipeline (competentiedefinities, projectbeschrijvingen) naar vectors
- [ ] `search_context(query, top_k)` als tool toevoegen
- [ ] Iteratie 4 conclusie - lost RAG het schaalprobleem van eager loading op?

### Overige sprint 3
- [ ] Canvas Developer Key aanvragen bij Fontys Canvas-beheerder + testomgeving regelen
- [ ] Technisch advies over infra-keuzes (hosting, koppeling Canvas)
- [ ] Afstemming met backend-teamgenoten over definitief databaseontwerp

## Sprint 4: Realiseren + Manage & Control (deadline 23 juni)

- [ ] CI/CD-pipeline inrichten
- [ ] Stabiliteit en veiligheid controleren
- [ ] Architectuurdocumentatie finaliseren + overdracht op git.fhict.nl
- [ ] Portfolio afronden + reflecties schrijven
