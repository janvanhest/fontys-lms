# Canvas Prototype — Specificatie

**Project:** Studentgericht leerplatform voor vraaggestuurd onderwijs
**Student:** Jan van Hest | Semester 6 | HBO-ICT Open Learning | Fontys
**Doel van dit document:** Volledige specificatie voor Claude Code om het prototype te bouwen. Waar de spec onvolledig is, maakt Claude Code een onderbouwde keuze en documenteert die onderaan in het changelog-blok.

---

## 1. Doel van het prototype

Dit is een digitaal paper prototype ter ondersteuning van de ideation-fase. Het doel is om de structuur en navigatie van een studentgericht leerplatform te kunnen tonen en bespreken met stakeholders (Eric Slaats, coaches, studenten) — niet om functionaliteit te demonstreren.

Het prototype heeft twee visuele modi:
- **Wireframe-modus** (default): ziet eruit als een hand-getekende schets. Monospace font, grijze dashed borders, geen kleur. Communiceert: "dit is een idee, geen ontwerp."
- **MUI-modus**: default Material UI styling. Communiceert: "zo zou het er in productie uitzien."

De gebruiker kan live wisselen tussen de twee modi via een toggle-knop in de topbar.

---

## 2. Tech stack

| Onderdeel | Keuze |
|---|---|
| Framework | React 19 (functional components + hooks) |
| Package manager | pnpm |
| Build tool | Vite |
| Taal | TypeScript (`strict: true`) |
| UI library | Material UI (MUI) v7 |
| Icons | @mui/icons-material |
| Styling | @emotion/react + @emotion/styled |
| Deploy | Netlify (`pnpm build` → `dist/`) |

Geen backend. Geen API calls. Alle data is statisch of lokale state.

---

## 3. Thema's

### 3.1 Wireframe thema (default)

```js
createTheme({
  typography: {
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: 12,
  },
  palette: {
    mode: 'light',
    primary: { main: '#555555' },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#333333',
      secondary: '#888888',
    },
  },
  shape: { borderRadius: 0 },
  shadows: Array(25).fill('none'),
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          border: '2px dashed #888',
          textTransform: 'none',
          color: '#555',
          backgroundColor: '#fff',
          '&:hover': { backgroundColor: '#eee' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #bbb',
          boxShadow: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#ccc' } },
    },
  },
})
```

### 3.2 MUI thema

```js
createTheme() // geen overrides — puur de MUI default
```

### 3.3 Theme toggle

- Toggle-knop in de topbar, rechts van de tabs
- Label wisselt tussen `"Switch to MUI"` en `"Switch to Wireframe"`
- State zit in `App.tsx`, wordt doorgegeven via ThemeProvider
- Geen page reload — alles re-rendert via ThemeProvider

---

## 4. Globale layout

```
┌─────────────────────────────────────────────────────────┐
│ TOPBAR                                                  │
│ [☰] [platform naam]        [Chat][Activities][Learning] [theme toggle] │
├──────────────┬──────────────────────────┬───────────────┤
│              │                          │               │
│   SIDEBAR    │      CHAT WINDOW         │  ACTIVITIES   │
│  (190px)     │      (flex: 1)           │  PANEL        │
│              │                          │  (220px)      │
│  [collapsed] │                          │  [hidden]     │
│              │                          │               │
├──────────────┴──────────────────────────┴───────────────┤
│ INPUT BAR                                               │
└─────────────────────────────────────────────────────────┘
```

- Totale hoogte: `100vh`
- Sidebar en Activities Panel hebben CSS transitions op `width` (0.25s ease)
- Input bar is altijd zichtbaar onderaan, behalve wanneer Learning tab actief is

---

## 5. Componenten

### 5.1 `App.tsx`

Verantwoordelijk voor:
- `themeMode` state: `'wireframe'` | `'mui'`
- `activeTab` state: `'chat'` | `'activities'` | `'learning'`
- `sidebarOpen` state: `boolean`
- ThemeProvider met het juiste theme object
- Rendert: `TopBar`, `Sidebar`, `ChatWindow` + `ActivitiesPanel` of `LearningPanel`

Automatisch gedrag:
- Als `activeTab` naar `'activities'` gaat → `sidebarOpen` wordt `false`
- Als `activeTab` terug naar `'chat'` of `'learning'` gaat → sidebar blijft dicht (gebruiker opent hem zelf)

---

### 5.2 `TopBar.tsx`

Props: `sidebarOpen`, `onToggleSidebar`, `activeTab`, `onTabChange`, `themeMode`, `onToggleTheme`

Elementen (links naar rechts):
1. Hamburger icon button (`MenuIcon`) — togglet sidebar
2. Platformnaam als placeholder tekst: `[platform naam]` in wireframe, `Canvas Prototype` in MUI
3. Tab buttons (MUI `Tabs` of drie losse `Button` componenten):
   - `Chat`
   - `Activities`
   - `Learning`
   - Actieve tab heeft een visueel onderscheid (underline of background)
4. Theme toggle button — uiterst rechts

---

### 5.3 `Sidebar.tsx`

Props: `open`, `onNewChat`, `history`, `activeChat`, `onSelectChat`

- Breedte: `190px` wanneer open, `0px` wanneer collapsed
- Transition: `width 0.25s ease`, `overflow: hidden`
- Bevat:
  - `[+ New chat]` button bovenaan
  - Label `Recent`
  - Lijst van history items — elk als clickable list item
  - Actief item heeft visueel onderscheid (bold border of background)
- History items zijn strings: `[chat titel]` als placeholder

---

### 5.4 `ChatWindow.tsx`

Props: `messages`, `onSendMessage`

- Flex column, `flex: 1`, `overflow-y: auto`
- Rendert lijst van `MessageBubble` componenten
- Input bar onderaan (zie 5.6)
- Scroll naar beneden bij nieuw bericht

Initiële berichten (statisch):
```js
[
  { role: 'assistant', text: '[welkomstbericht / openingsvraag]' },
  { role: 'user',      text: '[vraag van student]' },
  { role: 'assistant', text: '[antwoord — tekst / link / activiteit]' },
]
```

---

### 5.5 `MessageBubble.tsx`

Props: `role` (`'user'` | `'assistant'`), `text`

- `user`: uitgelijnd rechts, licht grijze achtergrond
- `assistant`: uitgelijnd links, transparante achtergrond
- Boven elke bubble een klein label: `student` of `assistent`
- In wireframe-modus: dashed border, monospace font, italic placeholder tekst
- In MUI-modus: MUI `Paper` of `Box` met lichte achtergrond

---

### 5.6 `InputBar.tsx`

Props: `onSend`

- Altijd onderaan `ChatWindow`
- Bevat een `TextField` (multiline, max 4 regels) en een send `IconButton`
- Enter zonder Shift verstuurt het bericht
- Bij versturen:
  1. Voeg user message toe aan `messages`
  2. Voeg na 0ms een statische assistant response toe: `[dit is een papieren prototype — hier zou een antwoord verschijnen]`
  3. Clear het input veld

---

### 5.7 `ActivitiesPanel.tsx`

Props: `open`

- Breedte: `220px` wanneer open, `0px` wanneer gesloten
- Transition: `width 0.25s ease`, `overflow: hidden`
- Border links: `1px solid` (kleur volgt thema)
- Bevat:
  - Titel: `Activiteiten deze week`
  - 4 placeholder activity cards (zie structuur hieronder)
  - Onderaan een annotatie label: `panel: activiteiten sidebar`

Activity card structuur:
```
[tag]        → kleine uppercase tekst: 'opdracht' / 'workshop' / 'competentie' / 'eigen activiteit'
[titel]      → '[activiteit titel]'
[status]     → '[status / deadline]'
```

---

### 5.8 `LearningPanel.tsx`

- Vervangt de `ChatWindow` wanneer Learning tab actief is
- Toont een gecentreerde placeholder:
  - Grote tekst: `Leerpad`
  - Kleine tekst: `Competenties en voortgang verschijnen hier`
- Input bar is verborgen wanneer Learning actief is

---

## 6. Bestandsstructuur

```
canvas-prototype/
├── public/
├── src/
│   ├── components/
│   │   ├── TopBar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── InputBar.tsx
│   │   ├── ActivitiesPanel.tsx
│   │   └── LearningPanel.tsx
│   ├── themes/
│   │   ├── wireframeTheme.ts
│   │   └── muiTheme.ts
│   ├── mui.d.ts
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── PROTOTYPE.md  ← dit bestand
```

---

## 7. Instructie voor Claude Code

**Setup (voer dit uit voordat je Claude Code start):**

```bash
pnpm create vite canvas-prototype --template react
cd canvas-prototype
pnpm install
pnpm add @mui/material @mui/icons-material @emotion/react @emotion/styled
pnpm add -D typescript typescript-eslint
```

**Start Claude Code:**

```bash
claude
```

**Geef Claude Code deze instructie:**

> Read `PROTOTYPE.md` completely before writing any code. Build the project exactly as specified. Where the spec leaves room for interpretation, make a sensible decision, implement it, and log it in the changelog at the bottom of this file. Do not ask for clarification — make a decision and document it.

---

## 8. Changelog / beslissingen Claude Code

*Claude Code vult dit blok aan tijdens de build.*

| # | Beslissing | Reden |
|---|---|---|
| 1 | MUI v7 gebruikt i.p.v. v6 (spec) | Vite template heeft MUI 7.3.9 geïnstalleerd; API is grotendeels compatibel, geen breaking changes relevant voor dit prototype. |
| 2 | Wireframe-detectie via `theme.typography.fontFamily?.includes('Courier')` in MessageBubble | Er is geen expliciete themeMode-prop op MessageBubble — detectie via het actieve thema is de cleanste oplossing zonder prop drilling. |
| 3 | Tab-stijl: `borderBottom` underline voor actieve tab, geen MUI `Tabs`-component | De spec noemt "drie losse Button componenten" als alternatief. Gekozen voor losse Buttons met `borderBottom` underline om conflicten met wireframe-stijl te vermijden. In MUI-modus worden de dashed borders van de wireframe-override geneutraliseerd via `border: none`. |
| 4 | `onNewChat` in Sidebar is een no-op `() => {}` | Spec definieert geen gedrag voor "New chat" buiten het tonen van de knop. Als paper prototype volstaat een visuele button zonder actie. |
| 5 | Beide user+assistant responses worden synchroon toegevoegd (0ms delay) | Spec zegt "na 0ms" — dat is synchroon. Geen `setTimeout` nodig. |
| 6 | `index.css` verwijderd uit `main.jsx` | Vite standaard CSS conflicteert met MUI CssBaseline en wireframe-thema (body margin, font resets). |
| 7 | `ActivitiesPanel` toont altijd 4 vaste placeholder-cards met realistische tag-waarden | Spec geeft de card-structuur maar geen concrete content. Gekozen voor 4 cards met elk een andere tag-waarde (opdracht, workshop, competentie, eigen activiteit) zodat alle tag-typen zichtbaar zijn voor stakeholders. |
| 8 | Timeline-lijn geïmplementeerd als absoluut gepositioneerde `Box` (geen CSS pseudo-element) | MUI `sx` ondersteunt geen `::before`/`::after` pseudo-elementen betrouwbaar voor layout. Een absolute `Box` is transparanter en makkelijker aan te passen. |
| 9 | Group dot = vierkant (wireframe) / cirkel (MUI); card connector dot idem maar 2px kleiner | De spec zegt "kleine vierkante dot" voor groepslabels in wireframe en "kleine cirkels in primary color" in MUI. Connector dots op cards zijn bewust iets kleiner zodat ze hiërarchisch ondergeschikt zijn aan de groepdots. |
| 10 | Timeline-lijnkleur in MUI via `color-mix(in srgb, primary 30%, transparent)` | `color-mix` is breed ondersteund in moderne browsers en vermijdt het handmatig berekenen van rgba-waarden. Geeft de gewenste "muted primary" look zonder extra dependencies. |
| 11 | Activiteiten verdeeld over 3 groepen (2 / 1 / 1 cards) | Spec definieert de 3 groepen maar niet hoeveel cards per groep. Gekozen voor 4 cards totaal (zelfde als vóór de refactor) verdeeld over de groepen zodat alle tag-typen zichtbaar blijven. |
| 12 | Card-borders in wireframe via inline `border: '1px dashed #bbb'` i.p.v. via `MuiPaper` theme-override | De wireframe thema-override zet `border: '1px solid #bbb'` op alle Papers. Voor de cards is een dashed border gewenst — dit wordt per kaart overschreven met een inline `sx` prop om de override te verbergen zonder het globale thema te wijzigen. |
| 13 | Panel verbreed van 220px naar 300px | 220px was te smal voor de kaartcontent; 300px geeft voldoende ruimte voor deadline + status naast elkaar en leesbare titels. |
| 14 | Timeline-layout omgebouwd naar twee-kolom flex (dot-kolom 24px + card flex:1) | Vorige versie positioneerde dots absoluut t.o.v. de kaart-rij, waardoor dots overlapten met de kaartinhoud. Twee-kolom flex is correct en betrouwbaar. |
| 15 | MUI-kaarten krijgen `borderLeft: 3px solid primary.main`; dots krijgen een `outline` in de achtergrondkleur zodat ze de lijn "onderbreken" | Geeft de MUI-variant een herkenbaar timeline-patroon zonder extra iconen of gekleurde achtergronden. |
| 16 | Groeplabels in MUI gekleurd in `primary.main`, in wireframe uppercase + grijs | Wireframe communiceert structuur via typografie (uppercase, monospace), MUI via kleur. |
| 17 | InputBar herbouwd als Claude-achtig invoerveld: container-border + `+` knop + `↑` send knop | Gebruiker vroeg om een invoerveld dat lijkt op Claude's UI. TextField vervangen door `InputBase` (geen eigen border) in een gestylede container. `+` knop linksonder (Tooltip: "Bestand toevoegen"), send knop rechtsonder. Wireframe: vierkante hoeken, dashed borders, fill bij actief. MUI: afgeronde hoeken, zachte schaduw, primary-kleur send knop. |
| 20 | MUI v7 audit: themes, alpha(), Collapse, Stack, Chip, theme-flag | `custom.isWireframe` flag toegevoegd aan beide themes — `useIsWireframeTheme()` gebruikt dit in plaats van fragiele fontFamily-string check. Alle `${color}40`/`${primary}0a` hex-opacity strings vervangen door `alpha(color, n)` uit `@mui/material/styles`. `maxHeight`-transitie in ActivityDetailPanel vervangen door `<Collapse>`. Flex `Box` in ActivityDetailPanel, ActivityCard, ActivitiesPanel en InputBar vervangen door `<Stack>`. Tag-labels in ActivityCard en ActivityDetailPanel worden nu als `<Chip>` gerenderd. wireframeTheme uitgebreid met overrides voor MuiAppBar, MuiIconButton, MuiInputBase, MuiListItemButton, MuiChip — alle met `({ theme })` callback zodat palette-tokens gebruikt worden i.p.v. hardcoded hex. muiTheme krijgt `textTransform: none` globaal op buttons. |
| 19 | Refactor: single responsibility en view/logic scheiding toegepast | `useIsWireframeTheme()` hook geïntroduceerd (was 3× gedupliceerd). Statische data verplaatst naar `src/constants.js` en `src/data/activities.js`. `ActivitiesPanel` opgesplitst in `TimelineDot`, `ActivityCard`, `ActivityDetailPanel`. Alle `key={index}` vervangen door stabiele id-keys. `Paper onClick` voorzien van `role="button"`, `tabIndex`, `onKeyDown` en `aria-pressed`. |
| 25 | Sticky "+ Nieuwe activiteit" knop onderaan ActivitiesPanel | `position: sticky, bottom: 0` footer toegevoegd tussen `ActivityDetailPanel` en de annotatie-label. Omdat de outer panel al `display: flex, flexDirection: column` is met `flex: 1` op de scrollbare zone, zit de footer altijd onderaan zonder dat de scroll-inhoud erdoor wordt beïnvloed. Wireframe: `#f9f9f9` achtergrond, `1px solid #ccc` bovenrand. MUI: `theme.palette.background.paper`, `theme.palette.divider`. Knop heeft geen functionaliteit — placeholder voor ideation-discussie. |
| 24 | Fix pill-shape inputveld + border radius via theme consolidated | Root cause pill-shape: MUI sx interpreteert `borderRadius: n` (getal) als vermenigvuldiger van `theme.shape.borderRadius`. `borderRadius: theme.shape.borderRadius` = `borderRadius: 8` = `8 × 8 = 64px`. Fix: string-notatie `` `${theme.shape.borderRadius}px` `` in InputBar container. `'50%'` op icon buttons is bewuste cirkelvorm, niet aangepast. `wireframeTheme.shape.borderRadius: 0 → 2` (lichte afronding voor Paper/Card; MuiIconButton en MuiChip houden `borderRadius: 0` als opzettelijke wireframe-vierkantoverschrijving). Beide thema-bestanden voorzien van een comment als permanente regel. Card-padding `px: 1.75 → 2` (16px) vereiste aanpassing in `ActivityCard.jsx` (niet in de opgegeven bestandslijst, maar onvermijdelijk). |
| 23 | Border radius via theme, responsive panelbreedte, ruimere spacing | `muiTheme.shape.borderRadius = 8` (was MUI default 4). `InputBar` container gebruikt nu `theme.shape.borderRadius` i.p.v. hardcoded `3` multiplier — radius is hierdoor altijd consistent met het actieve thema. `'50%'` op icon buttons is bewust (cirkels, geen thema-radius), niet gewijzigd. `MessageBubble` en `ActivitiesPanel` hadden geen hardcoded borderRadius — Paper erft automatisch uit het thema. Panelbreedte: `20rem` → `max(320px, 20vw)` — paneelgroeit mee op bredere schermen en heeft een minimum van 320px. Card-gap: `mb: 1.5` → `mb: 2` (16px) in `ActivityCard.jsx`. Groepafstand: `mb: 3` → `mb: 3.5` (28px) in `ActivitiesPanel.jsx`. |
| 22 | Layout-verbeteringen ActivitiesPanel: breedte `20rem`, ruimere spacing | Breedte van `300px` naar `20rem` (= 320px bij 16px basisfont) — `rem` schaalt mee met gebruikersinstellingen, wat beter is voor toegankelijkheid dan vaste `px`. Card-gap: `mb: 1` → `mb: 1.5` (12px). Card-padding: `p: 1.25` → `py: 1.5, px: 1.75` (12px / 14px). Groepafstand: `mb: 2` → `mb: 3` (24px). Gap na datumlabel separator: `mb: 1` → `mb: 2` (16px). Card-wijzigingen vereisten ook een aanpassing in `ActivityCard.jsx` — buiten de "only ActivitiesPanel.jsx" instructie, maar onvermijdelijk omdat die waarden daar wonen. |
| 21 | Groep-headers vervangen door horizontale scheidingslijn (chat date separator stijl) | `TimelineDot variant="group"` verwijderd. Nieuwe `GroupSeparator` subcomponent gebruikt MUI `Divider` met centered content — native `::before`/`::after` lijnen lopen aan beide kanten van het label. Verticale tijdlijn loopt ononderbroken door. Datumlabel staat eronder links uitgelijnd op `DOT_COL`-offset. Wireframe: lijn `#ccc`, label 10px monospace uppercase `#999`, datum 9px italic `#bbb`. MUI: `theme.palette.divider` lijn, `text.secondary` label, `text.disabled` datum. |
| 26 | Kleurgecodeerde linker borderaccentlijn per status op activity cards | 4px solid left border op elke kaart waarvan de kleur de status weergeeft: open=blauw (#1976d2), bezig=oranje (#ed6c02), feedback=rood (#d32f2f), afgerond=groen (#2e7d32). Achtergrondkleur van de kaart blijft ongewijzigd — alleen de linkerrand verandert. Wireframe: zelfde hex-waarden maar op 0.6 opacity via `alpha()` zodat het schetsmatige gevoel bewaard blijft. Status-to-color mapping opgeslagen in `src/constants/activityStatus.js` (nieuw bestand) samen met `STATUS_LABELS`, `STATUSES` en `ACTIVITY_TYPES`. Beginstatus per kaart afgeleid uit `activity.statusKey` in de data; valt terug op `'open'` als dat veld ontbreekt. `cardStatuses` state (`Record<id, statusKey>`) beheert overrides in `ActivitiesPanel.jsx`. |
| 27 | Drie-punt contextmenu op elke activity card | `MoreVertIcon` `IconButton` toegevoegd rechtsboven in de kaart (in dezelfde Stack-rij als de tag-chip). Eén `useRef` op de knop dient als anker voor alle drie `Menu`-componenten. Enkelvoudige `activeMenu` state (`null \| 'main' \| 'type' \| 'status'`) bepaalt welk menu open is — voorkomt positioneringsbugs met gesloten ankers. Hoofdmenu: "Hernoem titel", "Bewerk", "Verander soort ›", Divider, "Markeer als... ›". Type-submenu: terugknop + Coaching/Workshop/Sprint review/Semesterplan/Posterpresentatie/Overdracht. Status-submenu: terugknop + vier opties met gekleurde dot (matches status color). "Markeer als..." keuze is de enige met echte functionaliteit: roept `onStatusChange` aan en updatet direct de linkerrand. Alle andere items sluiten het menu zonder actie. |
| 28 | ActivitiesPanel: zichtbare status-border fix + groep `eerder` toegevoegd | `ActivitiesPanel.jsx` rendert de activity cards nu lokaal zodat de border exact als `border: '1px solid'`, `borderColor: 'divider'`, `borderLeft: '4px solid <statuskleur>'` gezet kan worden zonder uniforme all-side border die de linkerrand visueel neutraliseert. Wireframe gebruikt dezelfde full-opacity hex-kleuren voor duidelijke statusverschillen. Boven `deze week` staat nu een nieuwe groep `eerder` met datum `voor 14 mrt` en twee realistische completed challenge-cards: `Challenge markering` (`wo 5 mrt`) en `Gekozen challenge` (`vr 7 mrt`). Afgeronde kaarten krijgen in MUI `opacity: 0.75`; in wireframe blijven ze volledig opaak met groene linkerrand. |
| 29 | Volledige migratie naar TypeScript met strikte validatie | Alle bronbestanden zijn omgezet naar `.ts` / `.tsx`, met centrale domeintypes in `src/types.ts`, MUI theme-augmentatie in `src/mui.d.ts`, `tsconfig.json` met `strict: true`, en nieuwe scripts `pnpm typecheck` en `pnpm check`. Doel: compile-time validatie van props, statische data en theme-uitbreidingen, zonder extra architectuurlagen of overengineering. |
| 18 | Klikbaar detail-panel onderaan ActivitiesPanel via `maxHeight` slide-in transitie | Klik op een kaart toont een detail-panel (260px) dat omhoog schuift via `max-height: 0 → 260px, transition 0.3s ease`. Nogmaals klikken op dezelfde kaart sluit het panel. Inhoud: tag, titel, omschrijving (placeholder), deadline, status, gekoppelde competentie, actieknop. Sluitknop rechtsboven. Wireframe: dashed bovenrand, italic omschrijving. MUI: gekleurde bovenrand in primary, lichte primaire achtergrond. |
