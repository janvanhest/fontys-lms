# Review frontend scaffolding PR

**Sprint 3 | Infrastructure (Infrastructure) - Analyse - Niveau 1**
**Datum:** 7 mei 2026
**Auteur:** Tijn Knapen
**Onderwerp:** PR #3 op `janvanhest/fontys-lms` - "Enhance project structure with .gitignore, Storybook, and Material-UI integration"

## Waarom dit document

Jan heeft een grote pull request open staan die de basis legt voor de frontend van het LMS prototype. Voor ik approve wil ik de code zelf bekijken, lokaal draaien en beoordelen op een aantal punten:

1. Werkt het zoals beloofd
2. Is de stack passend voor een team van zes met wisselend ervaringsniveau
3. Welke risico's blijven over en welke follow-ups zijn nodig
4. Waar kan ik zelf vanuit Infrastructure waarde toevoegen

Dit document is mijn review en de basis voor de opmerkingen die ik op de PR achterlaat.

## Wat is opgeleverd

De PR voegt een nieuwe map `frontend/fontys-lms-frontend/` toe met 59 bestanden en ruim 7600 regels code. Ik heb de codebase lokaal opgezet en getest in zowel de app (`pnpm dev` op `localhost:5173`) als Storybook (`pnpm storybook` op `localhost:6006`).

### Volledig functioneel

- **AppLayout.** Topbar met sidebar links, content midden, SidePanel rechts. Tabs in de sidebar zijn werkende navigatie via een centrale `LayoutProvider` context.
- **SidePanel met ActivityTimeline.** Het meest uitgewerkte stuk. Activities zijn selecteerbaar, status (te doen, bezig, klaar) en type kunnen via menus worden gewijzigd. State leeft client-side, data komt uit een hardcoded `initialActivities` array.
- **ChatTab.** Visueel werkende chat-UI met messages, avatar, invoerveld. Berichten zijn nog statisch.
- **Routing.** React Router met Home, AppLayout (op `/`), Storybook demo (op `/storybook-demo`, alleen in dev), en NotFound page.
- **Theme switching.** Fontys Paars en Fontys Oranje werken in Storybook via de toolbar.
- **ChuckNorrisWidget.** Werkende demo met de publieke api.chucknorris.io. Niet bedoeld voor productie maar als referentie-implementatie van React Query patroon, presentational component scheiding, en Storybook stories.

### Pure placeholders

- **ChallengeTab.** Titel plus "Iframe-frame of challenge-canvas komt hier".
- **StappenplanTab.** Titel plus "Hier komt een documentachtige weergave".
- **CompetentiesTab.** Twee lege panels met overzicht en detail placeholders.

De architectuur en interactiepatronen zijn er. De inhoud van drie tabs moet nog gevuld worden.

## Stack analyse

| Laag | Keuze | Versie |
|------|-------|--------|
| Build tool | Vite | 8 |
| Framework | React | 19 |
| Taal | TypeScript | 6 |
| UI library | Material UI | 9 |
| Server state | TanStack Query | 5 |
| Routing | React Router | 7 |
| Component dev | Storybook | 10 |
| Linting | ESLint + typescript-eslint strict-type-checked | 10 / 8 |
| Package manager | pnpm via packageManager pinning | 10.33.2 |

De stack is consistent. Niet half MUI v5 en half v9, niet React 18 met React 19 patches. Alles is op de actuele major versie.

Tegelijk is de stack overal op de allernieuwste majors. React 19 is recent, MUI 9 nog korter uit, Vite 8 en Storybook 10 idem. Gevolg: minder Stack Overflow antwoorden die nog kloppen, en de moderne idiomen (zoals React 19's nieuwe context API met `use()` en `<Context value={}>` zonder `.Provider`) verschillen van wat juniors in oudere tutorials zien.

## Architectuur observaties

**Goed gevonden patronen:**

- **Path alias `@/`** via `tsconfig.app.json` en `vite.config.ts`. Geen relatieve `../../../` paden meer. Wordt afgedwongen via README en gebruikt door alle bestanden.
- **Layout state in een dedicated context.** `LayoutProvider` houdt activeTab, sidebarOpen en sidePanelOpen centraal. Componenten zoals SidePanel en Topbar consumeren via een `useLayout` hook met null-check. Schaalbaar als er straks meer layout-aspecten bijkomen.
- **Presentational vs container scheiding.** Zichtbaar bij ChuckNorrisWidget: de widget zelf is dom en krijgt alles via props, de hooks `useChuckNorrisJoke` en `useChuckNorrisCategories` regelen data. Hetzelfde patroon zal voor de Canvas API gebruikt worden.
- **`assertUnreachable` in AppLayout.** Switch op activeTab eindigt in een functie die TypeScript dwingt om alle cases af te dekken. Voegt een teamlid een nieuwe tab toe en vergeet hij hem in de switch te zetten, dan faalt de build. Dit type guardrails maakt de codebase robuuster bij wisselend ervaringsniveau.
- **Strenge ESLint config.** `strictTypeChecked`, geen `any`, max 150 regels per bestand, geen genest gedefinieerde componenten, `import type` afgedwongen. Dit verlaagt de PR review last en geeft juniors directe feedback bij verkeerde patronen.

**Aandachtspunten:**

- **README claimt MUI als "gepland".** In de stack-tabel staat MUI als gepland terwijl het al op v9 in `package.json` staat en overal gebruikt wordt. Kleine docs drift.
- **SidePanel state is intern.** Alle activities, geselecteerde id en menu-state leven in `useState` binnen SidePanel. Werkt prima voor scaffolding maar moet bij backend-integratie naar een React Query of een gedeelde store. Niet meteen veranderen, wel expliciet noteren dat dit bewust scaffolding is.
- **Tab-naar-sidepanel koppeling in LayoutProvider.** `selectTab('activities')` opent automatisch de SidePanel. Logica in de provider verstopt gedrag dat een component-consumer niet ziet. Voor nu acceptabel, kan later schoner.

## Wat dit betekent voor een team van zes

De fundering ondersteunt parallel werken op de volgende manieren:

- **Storybook in isolatie.** Een teamlid kan een component in Storybook bouwen zonder de hele app context te begrijpen. Stories zijn colocated naast de component (`Component.stories.tsx`). De drempel om bij te dragen is laag.
- **Lint als kwaliteitsbewaker.** ESLint vangt bestanden boven 150 regels, geneste componenten, `any` gebruik, ontbrekende `import type`. Dat verlaagt de discussielast in PRs.
- **Theme switcher en viewport switcher in Storybook.** Components worden direct getest tegen beide branding kleuren en op mobile, tablet en desktop breakpoints. Voor UX/Design kant van het team is dat een sterk hulpmiddel.

De fundering levert ook een risico op dat aandacht verdient:

- **Onboarding-frictie via corepack en pnpm versiepinning.** Ik liep er bij mijn lokale setup zelf tegenaan: corepack signature errors door verouderde keys, EPERM errors door admin-rechten, en PATH-conflicten tussen npm-installed en corepack-managed pnpm shims. Dit kost elke nieuwe teamlid minimaal een uur als er geen handleiding bij komt.

## Mijn bijdrage aan sprint 3

Op basis van deze review en het overleg dat eruit volgde stel ik de volgende bijdragen voor sprint 3 voor. Ze zijn opgesplitst in een Infrastructure-cluster waarop ik mijn niveau 1 bewijs bouw, en aanvullende bijdragen die het project verder helpen maar niet meetellen voor mijn portfolio omdat ze onder Software vallen waar ik al op niveau 2 zit.

### Infrastructure cluster

Twee samenhangende deliverables die de basis leggen voor parallel ontwikkelen door zes personen en die de chatbot van een database voorzien.

**1. Docker compose voor lokale dev**

Een `docker-compose.yml` op de root van het backend-project met een Postgres container, met de pgvector extensie alvast geconfigureerd gezien het ontwerp uit `db-ontwerp.md`. Iedere teamgenoot draait `docker compose up` en heeft een werkende lokale database, zonder externe afhankelijkheden of accounts. Reproduceerbaar en offline werkend.

**2. Gehoste Postgres bij Neon.tech voor shared/staging**

Naast de lokale containers één gedeelde Postgres instance op de Neon free tier. Postgres 17 met pgvector ondersteuning, automatic suspend bij inactiviteit, ruim voldoende voor prototype gebruik. Het verschil met de lokale setup is bewust:

- Lokaal: snel itereren zonder gedeelde state corrupt te maken.
- Shared: integratie testen tussen frontend en backend tegen dezelfde data.

Per teamgenoot wisselt de connection string in `.env` afhankelijk van welke modus ze gebruiken. De `.env` blijft uit git via gitignore, de connection strings worden via een apart kanaal gedeeld (Discord of LastPass).

### Aanvullende bijdragen buiten Infrastructure

Naast het Infrastructure cluster pak ik ook bijdragen op die niet meetellen voor mijn portfolio maar het project wel verder helpen:

- **Claude API integratie.** De groep heeft besloten van een lokaal Qwen-model over te stappen op de Claude API. Ik help met de integratie zelf en met het opzetten van het patroon zodat de andere teamleden erop verder kunnen.
- **Function calling.** Iteratie 3 in sprint 3. Hierbij help ik de structuur opzetten zodat function calls schoon van de chat-laag zijn gescheiden.
- **Frontend skelet uitbouwen.** De drie placeholder tabs (Challenge, Stappenplan, Competenties) hebben inhoud nodig. Ik kan helpen één of twee daarvan op te zetten als referentie-implementatie zodat minder ervaren teamleden een patroon hebben om te volgen.

### Openstaande afstemming

Voor het Infrastructure cluster moet eerst worden afgestemd met de backend-teamgenoten:

1. Hebben ze al een lokale Postgres setup of begin ik op nul.
2. Akkoord op de combinatie van lokale Docker compose en Neon shared instance.
3. Wie wordt eigenaar van de migrations en het schema (volgens `db-ontwerp.md` ligt het schema-ontwerp zelf bij hen).

Pas na die afstemming begin ik met `docker-compose.yml` en de Neon setup.

### Niet relevant voor deze sprint volgens groepsoverleg

- Tests (Vitest staat geïnstalleerd maar geen tests, geen `test` script). Bewuste keuze gegeven de prototype-status.
- Prettier toevoegen. Bewuste keuze, ESLint dekt de essentie.

## Mijn beslissing

Approve met twee kanttekeningen als comments op de PR:

1. README "Material UI gepland" wijzigen naar de daadwerkelijke v9.
2. Een korte sectie "Veelvoorkomende setup problemen" toevoegen aan de README, met de corepack/pnpm valkuil die ik vandaag tegenkwam en de oplossing (`npm install -g pnpm@10.33.2 --force` als bypass).

De codebase is solide en klaar om op te bouwen.

## Verantwoording competentie

> **Analyse (Infrastructure) – Niveau 1**
>
> In dit document analyseer ik de frontend-infrastructuur die mijn teamgenoot heeft voorgesteld voor het LMS prototype. Ik heb de codebase lokaal opgezet, beide servers (dev server en Storybook) gedraaid en de architectuur, de gekozen stack en de testbaarheid beoordeeld tegen kwaliteitseisen die voor ons team relevant zijn: onderhoudbaarheid, schaalbaarheid bij parallel werken met zes personen, robuustheid tegen broken builds, en onboarding-frictie voor minder ervaren teamleden. Op basis daarvan formuleer ik concrete aanbevelingen, een review-uitslag en een vervolgactie die ik zelf oppak. Hiermee toon ik aan dat ik een ICT-infrastructuur kan analyseren volgens vooraf gestelde kwaliteitseisen en de bevindingen kan vertalen naar concrete acties binnen een teamcontext.
