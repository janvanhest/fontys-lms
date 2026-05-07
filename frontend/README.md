# Frontend – Fontys LMS

Frontend van het Fontys LMS proof of concept. LTI-integreerbare webapplicatie gebouwd met React 19, TypeScript, Vite en Material UI. Zie de [root README](../README.md) voor de bredere projectcontext.

## Stack

| Tool        | Versie | Doel                   |
| ----------- | ------ | ---------------------- |
| React       | 19     | UI-framework           |
| TypeScript  | 6      | Typeveiligheid         |
| Vite        | 8      | Dev server & bundler   |
| Material UI | 9      | Componentenbibliotheek |
| pnpm        | 10     | Pakketmanager          |

## Installatie

Dit project gebruikt [nvm](https://github.com/nvm-sh/nvm) om de juiste Node.js-versie te beheren (zie `.nvmrc`) en [pnpm](https://pnpm.io) via [Corepack](https://github.com/nodejs/corepack) als pakketmanager.

**macOS**

```bash
brew install nvm

# Voeg toe aan ~/.zshrc of ~/.bashrc:
export NVM_DIR="$HOME/.nvm"
[ -s "$(brew --prefix)/opt/nvm/nvm.sh" ] && \. "$(brew --prefix)/opt/nvm/nvm.sh"
```

**Windows**

```powershell
winget install CoreyButler.NVMforWindows
# Herstart je terminal zodat nvm beschikbaar is
```

## Aan de slag

```bash
nvm install   # Installeer de Node-versie uit .nvmrc (eenmalig)
nvm use       # Activeer de juiste Node-versie

corepack enable  # Activeer pnpm via Corepack (eenmalig)
pnpm install     # Installeer dependencies

pnpm dev      # Start de dev server op http://localhost:5173
```

## Docker

Gebruik de root [docker-compose.yml](/Users/jhhest/school/fontys-lms/docker-compose.yml) om de frontend samen met de mock API te starten:

```bash
docker compose up --build
```

Dat start:

- de Vite dev server op `http://localhost:5173`
- de mock API op `http://localhost:3002`

Voor een production-style frontend container naast de mock API:

```bash
docker compose --profile prod up --build
```

Die extra service serveert de gebouwde app op `http://localhost:4173`.

### Veelvoorkomende setup problemen

Op Windows kan Corepack soms vastlopen op signature errors zoals `Cannot find matching keyid`. Als je daarna `pnpm` probeert te herstellen, kun je ook `EPERM` errors krijgen door admin-rechten op `C:\Program Files\nodejs`, of PATH-conflicten tussen een npm-geïnstalleerde en een Corepack-managed `pnpm`.

Werkende workaround: installeer de projectversie van `pnpm` rechtstreeks via npm en omzeil Corepack:

```powershell
npm install -g pnpm@10.33.2 --force
```

Open daarna een nieuwe terminal en controleer of de juiste versie actief is:

```powershell
pnpm --version # Verwacht: 10.33.2
```

## Storybook

Gebruik Storybook om componenten los van de applicatie te bekijken en te ontwikkelen. Start eerst de normale frontend-setup, en start daarna Storybook in een aparte terminalsessie.

```bash
nvm use
corepack enable
pnpm install

pnpm dev        # Start de app op http://localhost:5173
pnpm storybook  # Start Storybook op http://localhost:6006
```

## Structuur

Gebruik deze indeling als standaard voor nieuwe frontendcode:

- Routed schermen staan in `src/pages`.
- Herbruikbare UI-componenten staan in `src/components/<ComponentName>/`.
- Stories staan colocated in dezelfde componentmap, bijvoorbeeld `src/components/<ComponentName>/<ComponentName>.stories.tsx`.
- Hooks staan in `src/hooks`.

Importeer componenten via de folder-export, bijvoorbeeld `@/components/ChuckNorrisWidget`.

## Ontwikkelrichtlijnen

Gebruik altijd de laatste conventies van de gebruikte libraries. Valideer dit via de officiële documentatie of via [context7](https://context7.com) — een MCP-server die up-to-date docs rechtstreeks in Claude laadt.

Context7 toevoegen aan je setup:

```bash
npx ctx7 setup
```

Dit is de makkelijkste manier om Context7 werkend te krijgen met je huidige setup.

Voeg `use context7` toe aan je prompt om context7 expliciet te activeren:

> _"Hoe configureer ik ESLint met TypeScript? use context7"_

## Conventies

### Imports

`@/` is de projectstandaard voor absolute imports vanuit `src/`. Gebruik altijd `@/` in plaats van relatieve paden.

```ts
import { Button } from "@/components/Button"; // correct
import { Button } from "../../components/Button"; // niet doen
```

De alias is geconfigureerd in `tsconfig.app.json` (TypeScript) en expliciet gekoppeld in `vite.config.ts` via `resolve.alias`.

### Componenten

Een goede component doet één ding. Als je moeite hebt om te beschrijven wat hij doet zonder "en" te gebruiken, is dat een signaal om op te splitsen.

- **~150 regels max** — een langere component is een signaal, geen harde grens
- **Logica in custom hooks** — haal `useState`/`useEffect`-logica uit de component in een `use`-prefixed hook
- **Geen componenten binnen componenten** — definieer nooit een component binnen een render-functie
- **Props beperken** — meer dan 5 props wijst vaak op te veel verantwoordelijkheden

ESLint waarschuwt bij bestanden boven de 150 regels en geeft een fout bij componenten die binnen een render-functie zijn gedefinieerd.

### TypeScript

TypeScript is geen optie, het is de standaard. Het helpt bugs vroeg te vangen en maakt code begrijpelijker voor iedereen.

- **Typ props altijd expliciet** met een `interface` of `type`
- **Geen `any`** — gebruik `unknown` als het type echt onbekend is, of modelleer het correct
- **Typ de returnwaarde van custom hooks** expliciet
- **Gebruik `import type`** voor type-only imports — ESLint dwingt dit af
- **Vermijd type assertions (`as`)** tenzij echt noodzakelijk

## Scripts

| Script         | Beschrijving                            |
| -------------- | --------------------------------------- |
| `pnpm dev`     | Dev server met HMR                      |
| `pnpm build`   | TypeScript compileren + productie-build |
| `pnpm preview` | Preview van de productie-build          |
| `pnpm lint`    | ESLint uitvoeren                        |
