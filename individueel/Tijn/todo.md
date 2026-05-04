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

- [x] **Databasevoorstel eindbeeld** *(sprint3/db-voorstel.md)* - eigen chatbot-deel uitgewerkt, rest als aanname, als gespreksbasis voor backend-team
  *Competenties: Infrastructure - Design & Advise - Niveau 1*

### Iteratie 3: function calling
- [ ] Iteratie 3 onderzoek - kan Qwen 2.5 14B betrouwbaar functies aanroepen in plaats van eager-loaded context?
- [ ] Iteratie 3 prototype - functielijst, schema uitgebreid met course, project, event
- [ ] Iteratie 3 conclusie - lost function calling de scope drift (scenario 1) en boundary-interpretatie (scenario 4) uit iteratie 2 op?

### Iteratie 4: schrijfacties
- [ ] Iteratie 4 onderzoek - kan het model veilig de database bijwerken op basis van student-input ("opdracht X afgerond")?
- [ ] Iteratie 4 prototype - schrijfacties via function calling
- [ ] Iteratie 4 conclusie

### Overige sprint 3
- [ ] Modal.com vervolgonderzoek - kan Qwen 2.5 72B beter presteren op cloud-hardware?
- [ ] Technisch advies over infra-keuzes (hosting, koppeling Canvas)
- [ ] Afstemming met backend-teamgenoten over definitief databaseontwerp

## Sprint 4: Realiseren + Manage & Control (deadline 23 juni)

- [ ] CI/CD-pipeline inrichten
- [ ] Stabiliteit en veiligheid controleren
- [ ] Architectuurdocumentatie finaliseren + overdracht op git.fhict.nl
- [ ] Portfolio afronden + reflecties schrijven
