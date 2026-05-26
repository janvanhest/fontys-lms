# Versiebeheer - Fontys LMS Prototype

**Project:** Bouw je eigen Learning Management System (LMS)
**Auteur:** Tijn Knapen
**Tool:** Git + GitHub
**Repository:** github.com/janvanhest/fontys-lms
**Bijgehouden vanaf:** Sprint 1 (maart 2026)

Dit document legt vast hoe versiebeheer is ingericht voor het LMS-prototype: welke strategie we hanteren, hoe commits zijn opgebouwd, en welke versies er zijn opgeleverd per sprint.

---

## Branch-strategie

| Branch | Doel |
|--------|------|
| `dev` | Lopende ontwikkeling, standaard werkbranch |
| `feature/*` | Nieuwe functionaliteit, wordt gemerged naar `dev` |

Alle wijzigingen gaan via `dev`. Naar een stabiele release-branch wordt pas gewerkt als er werkende code is om te beschermen.

---

## Commit-conventies

Commits schrijf ik in het Engels, in de vorm:
`[type]: korte omschrijving`

| Type | Wanneer |
|------|---------|
| `feat` | Nieuwe functionaliteit |
| `fix` | Bug of fout hersteld |
| `docs` | Documentatie toegevoegd of aangepast |
| `chore` | Onderhoud, configuratie, opruimen |

Voorbeeld: `docs: add LTI 1.3 technical exploration`

---

## Versie-overzicht

| Versie | Sprint | Datum | Inhoud |
|--------|--------|-------|--------|
| v0.1 | Sprint 1 | maart 2026 | Analysefase afgerond: technische verkenning (Canvas API + LTI 1.3), ecosysteemanalyse, RAG-verkenning, reflectie, feedback-log. Nog geen werkende code. |
| v0.2 | Sprint 2 | april 2026 | Adviesfase + start realisatie: chatbot-strategie herzien, gebruikersinterview verwerkt, chatbot-scope uitgewerkt, iteratie 1 voltooid (onderzoeksdocument, prototype, conclusie). Eerste werkende prototype: Qwen 2.5 14B via Ollama, twee-laagse JSON-context, drie testscenarios. |
| v0.3 | Sprint 2 | april 2026 | Iteratie 2 voltooid: PostgreSQL 16 in Docker vervangt mock JSON, schema met vier tabellen, seed-script vanuit per-student JSON, loader-module en aangepaste chatbot die de database als context-bron gebruikt. Testresultaten zonder regressie t.o.v. iteratie 1. Bijdrage aan adviesrapport (Bijlage B en Bijlage E sectie 7) en databasevoorstel voor eindbeeld als opmaat naar sprint 3. |
| v0.4 | Sprint 3 | mei 2026 | Realisatiefase: team-PoC compleet met NestJS backend (modules activity, auth, chat, database, document, embedding, health, student), TypeORM met migrations, Postgres+pgvector via init.sql, Ollama in Docker met nomic-embed-text en frontend op React 19 + MUI 9 inclusief chat-UI. Mijn eigen end-to-end PoC (individueel/Tijn/sprint3/end-to-end-poc/) combineert RAG en function calling in een werkende hybride chatbot, met vier portfolio-docs (analyse, advies, ontwerp, INSTALL) en een realisatie-zip ingeleverd via Portflow voor Infra niveau 1. |

---

## Model- en componentversies

Naast code worden ook de gebruikte AI-modellen bijgehouden als infrastructuurcomponent.

| Component | Versie | Vanaf | Reden wissel |
|-----------|--------|-------|--------------|
| Python | 3.10.6 | iteratie 1 | Runtime voor het prototype |
| Ollama | 0.20.0 | iteratie 1 | Local model serving |
| LLM | Llama 3.1 8B | iteratie 1 start | Initiële keuze op basis van context window (128k) |
| LLM | Qwen 2.5 14B | iteratie 1 conclusie | Llama hallucineert structureel, Qwen beter in instructieopvolging en Nederlands |
| Docker | Desktop (huidige) | iteratie 2 | Uitvoeringsomgeving voor de database: reproduceerbaar, schoon weggooien en dichter bij productiedeployment |
| PostgreSQL | 16 | iteratie 2 | Vervangt mock JSON als context-bron; ondersteunt JSONB en pgvector voor latere uitbreidingen |
| psycopg | v3 | iteratie 2 | PostgreSQL-driver voor Python, bewust zonder ORM om queries expliciet te houden op PoC-schaal |
| NestJS | 11 | sprint 3 | TypeScript backend-framework voor de team-server, vervangt het Python-prototype uit iteratie 1/2 |
| TypeORM | 0.3.x | sprint 3 | ORM voor entities en migrations op de team-backend |
| pgvector | image pg16 + npm 0.2.1 | sprint 3 | Vector-extensie op Postgres met `vector(768)` type voor RAG |
| Ollama (in Docker) | 0.20+ | sprint 3 | Verplaatst van host naar Docker container, draait nomic-embed-text op CPU |
| nomic-embed-text | via Ollama | sprint 3 | 768-dim embedding model voor RAG-pipeline |
| Anthropic Claude | API (SDK 0.96) | sprint 3 | Vervangt het lokale Qwen 2.5 14B voor het chat-model, groepsbesluit mei 2026 |
| json-server | 1.0.0-beta.15 | sprint 3 | Mock REST API om de frontend los van de backend te kunnen ontwikkelen |
| React | 19 | sprint 3 | Frontend-framework |
| MUI | 9 (incl. x-chat alpha) | sprint 3 | UI-library met chat-component |
| Vite + Storybook | 8 / 10 | sprint 3 | Dev-server en component-isolatie voor de frontend |

Hardware referentie: RTX 3080, ~9GB VRAM bij Q4 quantisatie. Package-dependencies worden bijgehouden in `requirements.txt` per iteratie-prototype.

## Afspraken

- Persoonlijke tokens en wachtwoorden worden nooit in de repository opgeslagen. Gevoelige waarden gaan in omgevingsvariabelen (`.env`), en `.env` staat in `.gitignore`.
- Wijzigingen van teamleden worden via pull requests samengevoegd, zodat er altijd een moment van review is.

---

## Competentieverantwoording

**Infrastructure (Infrastructure) - Manage & Control - Niveau 1**

In dit document leg ik vast hoe het versiebeheer van het LMS-prototype is ingericht. Ik beschrijf de branch-strategie, de commit-conventies en de afspraken rondom gevoelige gegevens. Per sprint houd ik bij welke versie is opgeleverd en wat daarin zit. Dit zorgt ervoor dat de infrastructuur van het project bewust beheerd wordt en dat wijzigingen traceerbaar blijven. Hiermee toon ik aan dat ik procedures volg om ICT-infrastructuurcomponenten beschikbaar en correct geconfigureerd te houden.
