# Canvas Prototype

Studentgericht leerplatform-prototype in React, Vite, MUI en TypeScript.

## Stack

- React 19
- TypeScript (`strict: true`)
- Vite 8
- Material UI 7
- ESLint 9 + `typescript-eslint`
- pnpm

## Scripts

- `pnpm dev`: start de lokale ontwikkelserver
- `pnpm lint`: lint alle TypeScript-bestanden
- `pnpm typecheck`: valideer de volledige codebase met TypeScript
- `pnpm build`: maak een productiebuild
- `pnpm check`: draai lint, typecheck en build achter elkaar

## Werkwijze

Deze codebase gebruikt een directe TypeScript-aanpak:

- bronbestanden staan in `.ts` en `.tsx`
- domeintypes staan centraal in `src/types.ts`
- MUI theme-uitbreidingen staan in `src/mui.d.ts`
- nieuwe code blijft compact, expliciet en leesbaar

Doel is solide code zonder overengineering: duidelijke props, statische data die compile-time gevalideerd wordt, en zo min mogelijk impliciete aannames.

## Netlify

Deze app buildt naar `dist/`.

- `Build command`: `pnpm run build`
- `Publish directory`: `dist`
- `Functions directory`: leeg laten
