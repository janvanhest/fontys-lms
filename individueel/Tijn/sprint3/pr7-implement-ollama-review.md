# PR #7 review - Implement Ollama (embeddings + Postgres + document seeder)

**Auteur PR:** Jan van Hest
**Reviewer:** Tijn Knapen
**Datum:** 18 mei 2026
**Branch:** `feature/implement-ollama`
**PR:** https://github.com/janvanhest/fontys-lms/pull/7
**Focus van deze review:** infrastructure-kant (Ollama setup, pgvector configuratie, Docker), de NestJS modules op hoofdlijnen, niet de detail-implementatie van seeder-logica

## Samenvatting

PR voegt de fundamenten voor de RAG-pipeline toe in de team-PoC: een Ollama-service in Docker die het `nomic-embed-text` model serveert, een NestJS `EmbeddingModule` die daar via fetch tegen praat, een TypeORM `DatabaseModule` op de pgvector Postgres image, een `Document` entity met seeder die markdown-files uit `canvas_content/` chunkt en embedt, en een uitgebreide health check met DB-ping. Dit is de team-equivalent van de stack die ik in mijn eigen end-to-end PoC heb staan, en daarom kon ik er met meer gezag naar kijken dan bij een willekeurige PR.

## Wat is gewijzigd

```
compose.yaml                                       (ollama + postgres services)
compose.override.yaml                              (dev-overrides)
compose.prod.yaml                                  (prod-overrides)
ollama/entrypoint.sh                               (nieuw, model-pull + healthcheck)
backend/src/embedding/embedding.service.ts         (nieuw, fetch naar Ollama)
backend/src/embedding/embedding.module.ts          (nieuw)
backend/src/embedding/embedding.service.spec.ts    (nieuw, 67 regels)
backend/src/database/database.module.ts            (nieuw, TypeORM forRootAsync)
backend/src/document/document.entity.ts            (nieuw)
backend/src/document/document.module.ts            (nieuw)
backend/src/document/document-seeder.service.ts    (nieuw, 139 regels)
backend/src/document/document-seeder.service.spec.ts (nieuw, 203 regels)
backend/src/health/                                (uitbreiding met DB-ping)
backend/src/env.validation.ts                      (OLLAMA_URL + DATABASE_URL verplicht)
backend/src/app.module.ts                          (DocumentModule + DatabaseModule)
individueel/jan/infrastructure.md                  (419 regels, Jan's Infra niv 1 doc)
.env.example, README.md, package.json, pnpm-lock.yaml
```

Totaal ~8.300 regels toegevoegd, waarvan ~7.500 in `pnpm-lock.yaml`.

## Wat werkt en waarom dit een goeie basis is

**1. Healthcheck wacht op model-load voor de backend start.**
De Ollama-container heeft een healthcheck die `ollama show nomic-embed-text` doet. Pas als die slaagt is de container "healthy". Voorkomt cold-start race-conditions waar de backend al embedding-requests doet voordat het model klaar is. Dit was bij mij in iteratie 1 een terugkerend probleem.

**2. EmbeddingService faalt veilig.**
De Ollama response wordt expliciet type-narrowed: check op object, check op `embedding` array, check dat elke waarde een `number` is. Bij iedere afwijking een `logger.warn` en `null` retour. Geen runtime crash, geen stille data-corruptie. Dat is hoe je een externe service-call hoort af te handelen.

**3. Always-reset seed pattern.**
`DocumentSeederService.seed()` doet `documentRepository.createQueryBuilder().delete().execute()` voor het seeden begint. Garandeert consistent chunk-formaat na code-wijzigingen. Zelfde aanpak als ik in mijn end-to-end PoC heb. Trade-off van handmatige wijzigingen die verloren gaan is voor een PoC acceptabel.

**4. Seeder slaat zichzelf netjes over.**
Drie safe-fallbacks: (a) skipt seeding in `NODE_ENV=production`, (b) skipt als `canvas_content/` niet bestaat (warn ipv crash), (c) skipt individuele files met ontbrekende frontmatter velden. Robuust.

**5. Env-validation is verplicht.**
`OLLAMA_URL` en `DATABASE_URL` gaan via `getOrThrow`. Geen stille defaults die later voor ondiagnoseerbare fouten zorgen. Past bij wat we als team-afspraak hadden.

**6. Tests bij de belangrijke componenten.**
`embedding.service.spec.ts`, `health.service.spec.ts`, `document-seeder.service.spec.ts`. Niet exhaustief maar genoeg voor de kritieke paden (response-shape, error-paths, frontmatter-parsing).

**7. Entrypoint-script is verdedigend.**
Validatie op `MAX_WAIT_SECONDS` en `SLEEP_SECONDS` als positieve integers, een check of `ollama serve` niet zomaar uit de lucht valt, en een timeout op het wachten. Voorkomt eindeloos hangende containers.

## Aandachtspunten

**1. pgvector-setup is half. Comment geplaatst.**

Dit is het enige echte issue. In `document.entity.ts` regel 18 staat:

```ts
@Column({ type: 'real', array: true, nullable: true })
embedding!: number[] | null;
```

Dit wordt een gewone postgres `real[]`, geen pgvector `vector(768)` type. Tegelijk zit `pgvector/pgvector:pg16` als image in `compose.yaml` maar er is geen `postgres/init/01-init.sql` of vergelijkbaar script dat `CREATE EXTENSION IF NOT EXISTS vector;` draait. Dus de extension wordt nooit aangezet en het type wordt niet gebruikt.

Dit is geen runtime-bug binnen deze PR (embeddings worden opgeslagen, alles draait), maar het wordt een bug zodra iemand vector search wil bouwen:

- De `<->` cosine distance operator bestaat niet voor `real[]`
- Een migratie naar `vector(768)` faalt zonder dat de extension eerst aanstaat

Latente bug, gekoppeld aan de eerstvolgende RAG-PR. Comment geplaatst op regel 18 met verwijzing naar mijn `individueel/Tijn/sprint3/end-to-end-poc/postgres/init/01-init.sql` als concrete referentie hoe het wel moet.

**2. Heading-prefix in geembedde content is beperkter dan mijn aanpak. Geen comment geplaatst.**

In mijn end-to-end PoC sla ik elke HBO-i chunk op als `Infrastructure - Realise - Niveau 2\n\n[body]` zodat vector search niveau 1/2/3 van dezelfde activity uit elkaar kan houden. In Jan's `chunkByH2` wordt bij een H2-chunk de hele content inclusief `## Titel` opgeslagen, en bij een non-H2 (intro voor de eerste `##`) alleen de body met de page-title in metadata.

Voor `canvas_content/` weet ik niet hoe de pagina's gestructureerd zijn. Het kan prima werken zolang verschillende pagina's voldoende verschillen in body. Pas problematisch als er pagina's zijn met identieke sectie-titels die alleen in context verschillen. Geen comment van gemaakt: het is een mogelijke optimalisatie, geen actuele bug, en hangt af van data die ik niet zie.

**3. Ollama in Docker in plaats van op host. Geen comment geplaatst.**

Bij mij in mijn end-to-end PoC draait Ollama op de host via `host.docker.internal:11434` omdat GPU-passthrough vanuit een Docker-container op Windows wankel is. Jan zet hier Ollama binnen Docker met alleen CPU. Voor `nomic-embed-text` (klein embedding-model) is dat acceptabel, het draait zonder GPU prima en dat ontkoppelt de team-PoC van host-installaties.

Voor de team-PoC is dit zelfs een betere keuze dan mijn aanpak: `docker compose up` en het werkt, geen "eerst Ollama installeren op je host" stap. Geen comment, alleen een observatie voor mezelf.

## Reviewbeslissing

**Comment geplaatst, wachten op reactie van Jan voor approve.**

Comment op GitHub (line 18 van `backend/src/document/document.entity.ts`): de pgvector-setup is half. Vraag aan Jan of dit bewust een vervolgstap is voor een latere PR, of dat hij het in deze PR wil meenemen. Bij vervolgstap kan ik approven met de comment als open ticket. Bij meenemen request ik changes en pakt hij `postgres/init/01-init.sql` over uit mijn end-to-end PoC.

## Hoe dit raakt aan mijn eigen werk

Deze PR is in feite de team-versie van wat ik in `individueel/Tijn/sprint3/end-to-end-poc/` al heb staan. De stack overlapt voor 80%:

- pgvector Postgres image: zelfde
- Ollama met nomic-embed-text: zelfde (locatie verschilt, zie aandachtspunt 3)
- Embedding via fetch naar `/api/embeddings`: zelfde
- Always-reset seed bij boot: zelfde
- TypeORM op NestJS: zelfde

Verschillen:
- Mijn PoC heeft de vector search en chat-pipeline al af, deze PR stopt bij "embeddings opslaan"
- Mijn PoC gebruikt `vector(768)` met expliciete pgvector-extension, deze PR niet (zie aandachtspunt 1)
- Mijn PoC heeft `student_id = 1` hardcoded voor demo, deze PR heeft (nog) geen student-context
- Mijn PoC heeft live tool-traces en DB-viewer UI, deze PR heeft alleen de backend-laag

Wat ik hieruit kan benutten:
- De `EmbeddingService` met type-narrowing kan ik 1-op-1 overnemen, mijn versie is iets simpeler
- De `chunkByH2` parser is een goede start voor canvas_content, mijn PoC heeft alleen handmatige chunks
- De `entrypoint.sh` voor Ollama is netter dan mijn losse `ollama pull` stap in INSTALL.md
- Patroon voor `DocumentSeederService` met `OnApplicationBootstrap` is een nette plek voor seed-logica

Wat ik aan de team-PoC kan bijdragen na merge:
- `postgres/init/01-init.sql` met de pgvector-extension en het `vector(768)` type (oplossing voor aandachtspunt 1)
- Mijn `pg.service.ts` met de raw `<->` cosine search query, voor zodra de vector search PR landt
- Eventueel de heading-prefix strategie als blijkt dat `canvas_content/` pagina's met overlap heeft

## Conclusie

Solide infrastructuur-PR van Jan. Healthchecks, env-validation, type-narrowing, tests en defensieve seeder-logica zitten allemaal goed. Het enige echte issue is de half-aangesloten pgvector-setup, en dat is geen blocker voor deze PR maar een open vraag voor de volgende. Ik kan na merge direct mijn vector-search code en init.sql aanleveren voor de eerstvolgende RAG-PR.
