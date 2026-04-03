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

## Sprint 2: Adviseren + start Ontwerpen (deadline 19 april)

- [x] **Strategie chatbot herzien** - feedback Lennart verwerkt, structuur via componenten, context-architectuur toegevoegd *(sprint2/strategie-chatbot.md)*
- [x] **Iteratie 1 onderzoeksdocument** - modelkeuze, prompt-opzet, twee lagen, databasekeuze, testscenario's *(sprint2/iteratie1-1-onderzoek.md)*
- [x] **Chatbot scope document** - volledige beschrijving chatbot, gebruikers, architectuur *(Context/chatbot-scope.md)*
- [x] **Iteratie 1 prototype** - Python + Ollama (Qwen 2.5 14B), mock JSON, drie use cases getest *(sprint2/iteratie1-2-prototype/)*
- [x] **Iteratie 1 conclusie** - afgerond incl. modelwissel, scalability bottleneck, function calling vooruitblik *(sprint2/iteratie1-3-conclusie.md)*
- [ ] **Chatbot architectuurdiagram** - visueel overzicht: system prompt, eager loading (student), function calling (docent)
- [ ] **ERD database** - entiteiten: User, Course, Competency, StudentProgress, Activity, Project, Event. Database: PostgreSQL.
- [ ] Architectuurontwerp (C4-diagrammen level 1-2)
- [ ] Technisch advies over infra-keuzes (hosting, koppeling Canvas)
- [ ] Afstemming met team over wat we zelf bouwen vs. hergebruiken via Canvas
- [ ] **Versiebeheer uitbreiden** *(versie-tabel aanvullen, nieuwe afspraken vastleggen)*
  *Competenties: Infrastructuur – Manage & Control – Niveau 1*

## Sprint 3: Ontwerpen + Realiseren (deadline 24 mei)

- [ ] C4-diagrammen uitbreiden naar level 2-3
- [ ] Database-ontwerp + hostingomgeving opzetten (VPS / containers)
- [ ] Canvas API & LTI koppeling realiseren

## Sprint 4: Realiseren + Manage & Control (deadline 23 juni)

- [ ] CI/CD-pipeline inrichten
- [ ] Stabiliteit en veiligheid controleren
- [ ] Architectuurdocumentatie finaliseren + overdracht op git.fhict.nl
- [ ] Portfolio afronden + reflecties schrijven
