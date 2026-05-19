# Studentgericht leerplatform – Fontys LMS

## Aanleiding

Studenten gebruiken Canvas dagelijks, maar daaromheen hangt een lappendeken aan losse tools: Portflow voor portfolio's, FeedPulse, Fontys Links, Studycoach. Iedere tool doet wat hij doet, maar samen wordt het al snel onoverzichtelijk.

Daardoor ontstaat wrijving op twee vlakken. Studenten vinden niet wat ze zoeken — informatie is verspreid, de zoekfunctie schiet tekort, en het aanbod is grotendeels tekstgebaseerd terwijl steeds minder studenten veel lezen. Daarnaast is Canvas gebouwd rondom modules en cursussen, terwijl het onderwijs steeds meer vraaggestuurd wordt — denk aan Open Learning en Digital Transformer, met challenges die weken tot jaren kunnen duren. Stakeholder Eric Slaats herkent dit: studenten kloppen bij de docent aan in plaats van het systeem te raadplegen, workshops worden slecht bezocht door precies de mensen die er baat bij zouden hebben, en de LMS sluit simpelweg niet aan op vraaggestuurd werken.

## Kernvraag

_Hoe verbeter je de leerervaring binnen Canvas zodat niet de module maar de student en diens activiteiten centraal staan, en vraaggestuurd onderwijs ondersteund wordt met zo weinig mogelijk frictie?_

Canvas blijft de basis — een compleet nieuw LMS bouwen is niet het doel. Canvas heeft een open API en ondersteunt LTI, waardoor externe tools naadloos geïntegreerd kunnen worden. Technisch gaat het om webtechnologie, de Canvas API, LTI en mogelijk AI.

## Doelstelling

Aan het einde van het semester staat er een **gevalideerd proof of concept** dat aantoont hoe de Canvas-ervaring verbeterd kan worden voor studenten en coaches in vraaggestuurd onderwijs. Productierijp hoeft het niet te zijn; het gaat erom dat het concept werkt. Analyse, documentatie en architectuurbeslissingen worden zo opgezet dat een volgend team het project zonder veel moeite kan oppakken.

## Scope

**Binnen scope:** gebruikersonderzoek (studenten dag/avond, coaches, docenten), ideation (ideeën ophalen, scoren en een richting kiezen), een PoC gekoppeld aan Canvas via API en/of LTI, architectuurdocumentatie (C4, ADR's) voor overdraagbaarheid, en validatie met echte gebruikers.

**Buiten scope:** een volledig nieuw LMS bouwen, productierijpe software voor alle rollen, migratie van FeedPulse of Portflow, en beheer of hosting na het semester.

## Vereisten

### Make installeren

**Mac**
```bash
brew install make
```

**Windows**
```powershell
winget install GnuWin32.Make
```

> Geen Make? Je kunt de commando's ook direct uitvoeren — zie de tabel hieronder.

## Lokale omgeving starten

Kopieer eerst de environment variabelen:

```bash
cp .env.example .env   # pas credentials aan waar nodig
```

| Commando | Alternatief zonder Make | Beschrijving |
|---|---|---|
| `make dev` | `docker compose up --watch` | Start alle development services met hot reload |
| `make prod` | `docker compose -f compose.yaml -f compose.prod.yaml up --build` | Bouwt en start de productie-images |
| `make down` | `docker compose down` | Stopt alle containers |
| `make test` | `cd backend && pnpm test -- --verbose` | Draait de backend unit tests met beschrijvende output |

**Hoe werkt de Makefile?**

De root `Makefile` bevat alleen dunne shortcuts voor veelgebruikte developer-commando's. Targets zoals `dev`, `prod`, `down` en `test` staan onder `.PHONY`. Volgens de GNU Make-documentatie markeert dat ze als command-targets in plaats van bestanden, zodat `make test` altijd wordt uitgevoerd, ook als er toevallig een bestand of map `test` bestaat.

**Debuggen**

```bash
docker compose config                                      # toont de samengevoegde dev-configuratie
docker compose -f compose.yaml -f compose.prod.yaml config # toont de samengevoegde prod-configuratie
docker compose logs -f <service>                           # live logs van een service (backend, frontend, ...)
```

Als je een oud lokaal Postgres-volume hebt van vóór de pgvector-wijziging op `documents.embedding`, reset die dan eenmalig:

```bash
docker compose down -v
docker compose up --watch
```

De development stack exposeert standaard:

- de frontend dev server op `http://localhost:5173`
- Storybook op `http://localhost:6006`
- de mock API op `http://localhost:3002`

**Hoe werkt de split?**

- `compose.yaml` — gedeelde services (postgres, mock-api)
- `compose.override.yaml` — dev-configuratie, automatisch samengevoegd door Docker bij `docker compose up`
- `compose.prod.yaml` — prod-configuratie, expliciet geladen via `make prod`

## Packages toevoegen aan de backend

De backend heeft een eigen `pnpm-lock.yaml` die Docker gebruikt. pnpm pikt echter de root `pnpm-workspace.yaml` op, waardoor een gewone `pnpm add` de verkeerde lockfile bijwerkt. Gebruik altijd:

```bash
cd backend
pnpm add <package> --ignore-workspace
```
