# SidePanel Activities Wiring — Design Spec

**Date:** 2026-05-20
**Branch:** feat/wire-activities-to-frontend
**Status:** Approved

## Doel

De backend `GET /activities` endpoint koppelen aan de frontend `SidePanel`, en de SidePanel omzetten naar een generieke shell zodat in de toekomst andere content types (bijv. vanuit de chatbot of eventstream) kunnen worden getoond zonder de shell aan te passen.

---

## 1. LayoutContext uitbreiding

`LayoutContext` krijgt twee nieuwe velden naast de bestaande `sidePanelOpen`:

```ts
type SidePanelContent = { type: 'activities' };
// Uitbreidbaar zonder breaking changes:
// | { type: 'document-preview'; documentId: string }

sidePanelContent: SidePanelContent | null;
openSidePanel: (content: SidePanelContent) => void;
```

`openSidePanel(content)` stelt zowel `sidePanelContent` als `sidePanelOpen = true` in één aanroep in. De bestaande `setSidePanelOpen` toggle-knop blijft ongewijzigd werken.

Vanuit de chatbot of SSE-handler is het openen later één aanroep:
```ts
openSidePanel({ type: 'activities' });
```

`LayoutStoryProvider` krijgt dezelfde uitbreiding (`sidePanelContent` prop) zodat Storybook stories het content type kunnen specificeren.

---

## 2. Data layer

### `frontend/src/api/activities.ts`
Plain fetch met React Query v5 `queryOptions` patroon — consistent met de bestaande `api/student.ts` en `api/chat.ts`:

```ts
export const activitiesQueryOptions = queryOptions({
  queryKey: ['activities'],
  queryFn: (): Promise<Activity[]> =>
    fetch(`${API_BASE_URL}/activities`).then(r => r.json()),
});
```

Authenticatie wordt afgehandeld door de backend (`MockAuthGuard` in dev via `MOCK_AUTH=true`). De frontend hoeft geen studentId mee te sturen.

### `frontend/src/types/activity.ts`
Spiegelt de backend `ActivityResponseDto` 1:1. Backend is leidend — geen eigen velden verzinnen:

```ts
export type ActivityStatus = 'open' | 'bezig' | 'feedback' | 'afgerond';
export type ActivityType =
  | 'opdracht' | 'workshop' | 'competentie' | 'eigen activiteit'
  | 'challenge' | 'coaching' | 'sprint review' | 'semesterplan'
  | 'posterpresentatie' | 'overdracht';

export type Activity = {
  id: string;
  portflowId: number | null;
  title: string;
  description: string | null;
  position: number;
  type: ActivityType;
  status: ActivityStatus;
  deadline: string | null;
  competencyLabel: string | null;
  createdAt: string;
  updatedAt: string;
};
```

Het bestaande `ActivityItem` type (met `groupKey` en `deadlineLabel`) vervalt. Die twee velden zijn UI-afleidingen, geen data.

### `frontend/src/utils/activity-grouping.ts`
Berekent UI-specifieke afleidingen uit `Activity.deadline`:

- `groupKey: 'eerder' | 'deze-week' | 'volgende-week' | 'later'` — op basis van deadline relatief aan vandaag
- `deadlineLabel: string` — bijv. `"vr 14 mrt"` via `Intl.DateTimeFormat` met `nl-NL` locale (geen externe date-library nodig)

Exporteert `groupActivities(activities: Activity[]): ActivityGroupSection[]`.

---

## 3. SidePanel shell + registry

### `frontend/src/layouts/SidePanel.tsx`
Wordt een pure shell: animatie, breedte, border, open/dicht. Geen activiteiten-logica meer.

```tsx
const Panel = PANEL_REGISTRY[sidePanelContent?.type ?? ''];
return <Shell>{Panel ? <Panel /> : null}</Shell>;
```

### `frontend/src/layouts/side-panel/panel-registry.ts`
Koppelt content type aan component:

```ts
import { ActivitiesPanel } from './ActivitiesPanel';

export const PANEL_REGISTRY: Record<string, React.ComponentType> = {
  activities: ActivitiesPanel,
};
```

Nieuw content type toevoegen = één regel in de registry. `SidePanel.tsx` zelf hoeft niet aangepast te worden.

### `frontend/src/layouts/side-panel/ActivitiesPanel.tsx`
Erft alle huidige logica uit `SidePanel.tsx` (state, handlers, menu's, details). Fetcht zelf via:

```ts
const { data: activities = [] } = useQuery(activitiesQueryOptions);
```

Roept `groupActivities()` aan voor de gegroepeerde weergave. De `initialActivities` mock in `constants.ts` vervalt.

---

## 4. Directory structuur

```
frontend/src/
  api/
    activities.ts               ← nieuw
    student.ts                  ← ongewijzigd
    chat.ts                     ← ongewijzigd

  types/
    activity.ts                 ← nieuw (Activity type)

  utils/
    activity-grouping.ts        ← nieuw
    sidebarTitle.ts             ← verplaatst vanuit layouts/

  layouts/
    AppLayout.tsx / .stories.tsx
    Sidebar.tsx / .stories.tsx
    SidePanel.tsx / .stories.tsx  ← shell only
    topbar/
      Topbar.tsx / .stories.tsx
      StudentMenu.tsx
    side-panel/
      panel-registry.ts         ← nieuw
      ActivitiesPanel.tsx       ← nieuw (logica uit SidePanel)
      ActivityTimeline.tsx      ← prop types: ActivityItem → Activity
      ActivityDetails.tsx       ← prop types: ActivityItem → Activity
      ActivityMenus.tsx         ← prop types: ActivityItem → Activity
      constants.ts              ← initialActivities mock vervalt
      types.ts                  ← ActivityItem vervalt, GroupKey/ActivityGroupSection blijft

  tabs/                         ← structuur ongewijzigd
```

---

## 5. Mee-updaten als gevolg van redesign

| Bestand | Wijziging |
|---|---|
| `context/layout-context.ts` | `sidePanelContent` + `openSidePanel` toevoegen |
| `context/LayoutProvider.tsx` | state + handler implementeren |
| `storybook/LayoutStoryProvider.tsx` | `sidePanelContent` prop toevoegen |
| `tabs/chat/ChatTab.stories.tsx` | `SidePanelOpen` story krijgt content type mee |
| `layouts/sidebarTitle.test.ts` | verplaatsen naar `utils/` |

---

## 6. Wat nog niet geïmplementeerd wordt

- Openen vanuit chatbot / SSE eventstream — de `openSidePanel()` hook is beschikbaar, maar de call vanuit de chat wordt pas later toegevoegd als de exacte UX duidelijk is (bijv. welke activiteit geselecteerd toont bij een AI-verwijzing)
- Meerdere content types buiten `activities` — het systeem ondersteunt dit via de registry, maar er worden nog geen andere types gedefinieerd

---

## Technische randvoorwaarden

- `MOCK_AUTH=true` vereist in `.env` voor lokale development (backend auth guard)
- MUI v9 / React 19 / TanStack Query v5 — huidige theme implementatie (`createTheme`) is correct en hoeft niet aangepast
- Geen nieuwe dependencies — `Intl.DateTimeFormat` voor date formatting
