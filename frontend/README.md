# Frontend – Fontys LMS

Frontend van het Fontys LMS proof of concept. LTI-integreerbare webapplicatie gebouwd met React 19, TypeScript, Vite en Material UI. Zie de [root README](../README.md) voor de bredere projectcontext.

## Stack

| Tool        | Versie    | Doel                   |
| ----------- | --------- | ---------------------- |
| React       | 19        | UI-framework           |
| TypeScript  | 6         | Typeveiligheid         |
| Vite        | 8         | Dev server & bundler   |
| Material UI | (gepland) | Componentenbibliotheek |
| pnpm        | 10        | Packagemanager         |

## Installatie

Dit project gebruikt [nvm](https://github.com/nvm-sh/nvm) om de juiste Node.js-versie te beheren (zie `.nvmrc`) en [pnpm](https://pnpm.io) via [Corepack](https://github.com/nodejs/corepack) als packagemanager.

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

## Scripts

| Script         | Beschrijving                            |
| -------------- | --------------------------------------- |
| `pnpm dev`     | Dev server met HMR                      |
| `pnpm build`   | TypeScript compileren + productie-build |
| `pnpm preview` | Preview van de productie-build          |
| `pnpm lint`    | ESLint uitvoeren                        |
