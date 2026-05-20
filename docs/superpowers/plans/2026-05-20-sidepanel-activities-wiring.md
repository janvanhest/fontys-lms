# SidePanel Activities Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the backend `GET /activities` endpoint to the frontend `SidePanel`, replacing hardcoded mock data with real API data, while refactoring `SidePanel` into a generic shell driven by `LayoutContext` so other content types can be loaded in the future.

**Architecture:** `LayoutContext` gains `sidePanelContent` (union type) and `openSidePanel()`. `SidePanel` becomes a pure shell that looks up the active panel component from a registry. `ActivitiesPanel` is extracted from the current `SidePanel` logic and fetches its own data via React Query. A `groupActivities()` utility derives `groupKey` and `deadlineLabel` from the backend `Activity` type — no new dependencies needed.

**Tech Stack:** React 19, MUI v9, TanStack React Query v5, Vitest, TypeScript, `Intl.DateTimeFormat` (built-in)

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `frontend/src/types/activity.ts` | Core `Activity` type mirroring backend DTO |
| Create | `frontend/src/api/activities.ts` | `activitiesQueryOptions` fetch wrapper |
| Create | `frontend/src/utils/activity-grouping.ts` | `groupActivities()` — computes `groupKey` + `deadlineLabel` |
| Create | `frontend/src/utils/activity-grouping.test.ts` | Unit tests for grouping logic |
| Create | `frontend/src/layouts/side-panel/panel-registry.ts` | Maps content type strings to panel components |
| Create | `frontend/src/layouts/side-panel/ActivitiesPanel.tsx` | Current SidePanel logic + useQuery |
| Modify | `frontend/src/layouts/side-panel/types.ts` | Remove `ActivityItem`/`ActivityStatus`/`ActivityType`, re-export from `types/activity.ts`, update `ActivityGroupSection` |
| Modify | `frontend/src/layouts/side-panel/constants.ts` | Remove `initialActivities` mock |
| Modify | `frontend/src/layouts/SidePanel.tsx` | Pure shell — no activity logic |
| Modify | `frontend/src/layouts/side-panel/ActivityCard.tsx` | Add `deadlineLabel: string` prop |
| Modify | `frontend/src/layouts/side-panel/ActivityTimeline.tsx` | Compute `deadlineLabel`, update types |
| Modify | `frontend/src/layouts/side-panel/ActivityDetails.tsx` | `ActivityItem` → `Activity`, format deadline inline |
| Modify | `frontend/src/layouts/side-panel/ActivityMenus.tsx` | `ActivityItem` → `Activity` |
| Modify | `frontend/src/context/layout-context.ts` | Add `SidePanelContent`, `sidePanelContent`, `openSidePanel` |
| Modify | `frontend/src/context/LayoutProvider.tsx` | Implement new state + handler |
| Modify | `frontend/src/storybook/LayoutStoryProvider.tsx` | Add `sidePanelContent` prop |
| Modify | `frontend/src/tabs/chat/ChatTab.stories.tsx` | Update `SidePanelOpen` story |
| Move | `layouts/sidebarTitle.ts` → `utils/sidebarTitle.ts` | Utility not layout |
| Move | `layouts/sidebarTitle.test.ts` → `utils/sidebarTitle.test.ts` | Follow the source |
| Move | `layouts/Topbar.tsx` + `Topbar.stories.tsx` + `StudentMenu.tsx` → `layouts/topbar/` | Group related files |

---

## Task 1: Core Activity type

**Files:**
- Create: `frontend/src/types/activity.ts`
- Modify: `frontend/src/layouts/side-panel/types.ts`

- [ ] **Step 1: Create `frontend/src/types/activity.ts`**

```typescript
export type ActivityStatus = 'open' | 'bezig' | 'feedback' | 'afgerond';

export type ActivityType =
  | 'opdracht'
  | 'workshop'
  | 'competentie'
  | 'eigen activiteit'
  | 'challenge'
  | 'coaching'
  | 'sprint review'
  | 'semesterplan'
  | 'posterpresentatie'
  | 'overdracht';

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

- [ ] **Step 2: Update `frontend/src/layouts/side-panel/types.ts`**

Remove `ActivityStatus`, `ActivityType`, and `ActivityItem`. Re-export `ActivityStatus` and `ActivityType` from the new types file. Update `ActivityGroupSection.items` to use `Activity`.

```typescript
export type { ActivityStatus, ActivityType } from '@/types/activity';
import type { Activity } from '@/types/activity';

export type GroupKey = 'eerder' | 'deze-week' | 'volgende-week' | 'later';
export type OpenSubmenu = 'type' | 'status' | null;

export type ActivityGroupSection = {
  groupKey: GroupKey;
  label: string;
  rangeLabel: string;
  items: Activity[];
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && pnpm exec tsc --noEmit 2>&1 | head -40
```

Expected: errors only in files that still import `ActivityItem` (those are fixed in later tasks — this is expected at this point).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/types/activity.ts frontend/src/layouts/side-panel/types.ts
git commit -m "feat(types): add core Activity type mirroring backend DTO"
```

---

## Task 2: Activities API

**Files:**
- Create: `frontend/src/api/activities.ts`

- [ ] **Step 1: Create `frontend/src/api/activities.ts`**

```typescript
import { queryOptions } from '@tanstack/react-query';
import type { Activity } from '@/types/activity';

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';

export const activitiesQueryOptions = queryOptions({
  queryKey: ['activities'],
  queryFn: async (): Promise<Activity[]> => {
    const res = await fetch(`${apiBase}/activities`);
    if (!res.ok) throw new Error('Kon activiteiten niet ophalen');
    return res.json() as Promise<Activity[]>;
  },
});
```

- [ ] **Step 2: Verify TypeScript compiles for the new file**

```bash
cd frontend && pnpm exec tsc --noEmit 2>&1 | grep "activities.ts"
```

Expected: no errors on this file.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/activities.ts
git commit -m "feat(api): add activitiesQueryOptions for GET /activities"
```

---

## Task 3: Activity grouping utility (TDD)

**Files:**
- Create: `frontend/src/utils/activity-grouping.test.ts`
- Create: `frontend/src/utils/activity-grouping.ts`

- [ ] **Step 1: Write the failing tests**

Create `frontend/src/utils/activity-grouping.test.ts`:

```typescript
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { Activity } from '@/types/activity';
import { groupActivities, formatDeadlineLabel } from './activity-grouping';

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'test-id',
    portflowId: null,
    title: 'Test activiteit',
    description: null,
    position: 0,
    type: 'opdracht',
    status: 'open',
    deadline: null,
    competencyLabel: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Pin "today" to a known Wednesday so week bounds are deterministic
const WEDNESDAY_2026_05_20 = new Date('2026-05-20T12:00:00.000Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(WEDNESDAY_2026_05_20);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('formatDeadlineLabel', () => {
  it('returns an em dash for null deadline', () => {
    expect(formatDeadlineLabel(null)).toBe('—');
  });

  it('formats a date in Dutch short weekday + day + month', () => {
    // 2026-05-14 is a Thursday (do)
    const label = formatDeadlineLabel('2026-05-14');
    expect(label).toMatch(/do/i);
    expect(label).toMatch(/14/);
    expect(label).toMatch(/mei/i);
  });
});

describe('groupActivities — groupKey assignment', () => {
  it('assigns "eerder" to a deadline before this week', () => {
    // Monday of week 2026-05-20 is 2026-05-18 — so 2026-05-17 is last week
    const activity = makeActivity({ id: '1', deadline: '2026-05-17' });
    const groups = groupActivities([activity]);
    const eerder = groups.find((g) => g.groupKey === 'eerder');
    expect(eerder?.items).toHaveLength(1);
    expect(eerder?.items[0].id).toBe('1');
  });

  it('assigns "deze-week" to a deadline within this week', () => {
    // 2026-05-20 is Wednesday this week
    const activity = makeActivity({ id: '2', deadline: '2026-05-20' });
    const groups = groupActivities([activity]);
    const thisWeek = groups.find((g) => g.groupKey === 'deze-week');
    expect(thisWeek?.items).toHaveLength(1);
  });

  it('assigns "volgende-week" to a deadline in next week', () => {
    // 2026-05-25 is Monday next week
    const activity = makeActivity({ id: '3', deadline: '2026-05-25' });
    const groups = groupActivities([activity]);
    const nextWeek = groups.find((g) => g.groupKey === 'volgende-week');
    expect(nextWeek?.items).toHaveLength(1);
  });

  it('assigns "later" to a deadline beyond next week', () => {
    const activity = makeActivity({ id: '4', deadline: '2026-06-10' });
    const groups = groupActivities([activity]);
    const later = groups.find((g) => g.groupKey === 'later');
    expect(later?.items).toHaveLength(1);
  });

  it('assigns "later" to an activity with no deadline', () => {
    const activity = makeActivity({ id: '5', deadline: null });
    const groups = groupActivities([activity]);
    const later = groups.find((g) => g.groupKey === 'later');
    expect(later?.items).toHaveLength(1);
  });

  it('omits groups with no items', () => {
    const activity = makeActivity({ id: '6', deadline: '2026-05-20' });
    const groups = groupActivities([activity]);
    expect(groups.every((g) => g.items.length > 0)).toBe(true);
  });

  it('returns groups in order: eerder → deze-week → volgende-week → later', () => {
    const activities = [
      makeActivity({ id: 'a', deadline: '2026-05-17' }),
      makeActivity({ id: 'b', deadline: '2026-05-20' }),
      makeActivity({ id: 'c', deadline: '2026-05-25' }),
      makeActivity({ id: 'd', deadline: '2026-06-10' }),
    ];
    const groups = groupActivities(activities);
    expect(groups.map((g) => g.groupKey)).toEqual([
      'eerder',
      'deze-week',
      'volgende-week',
      'later',
    ]);
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
cd frontend && pnpm exec vitest run src/utils/activity-grouping.test.ts 2>&1 | tail -20
```

Expected: FAIL — `Cannot find module './activity-grouping'`

- [ ] **Step 3: Implement `frontend/src/utils/activity-grouping.ts`**

```typescript
import { groupMeta, groupOrder } from '@/layouts/side-panel/constants';
import type { Activity } from '@/types/activity';
import type { ActivityGroupSection, GroupKey } from '@/layouts/side-panel/types';

export function formatDeadlineLabel(deadline: string | null): string {
  if (!deadline) return '—';
  return new Intl.DateTimeFormat('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(deadline));
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function getGroupKey(deadline: string | null, today: Date): GroupKey {
  if (!deadline) return 'later';

  const date = new Date(deadline);
  date.setHours(0, 0, 0, 0);

  const thisMonday = getMondayOfWeek(today);
  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(nextMonday.getDate() + 7);
  const mondayAfterNext = new Date(nextMonday);
  mondayAfterNext.setDate(mondayAfterNext.getDate() + 7);

  if (date < thisMonday) return 'eerder';
  if (date < nextMonday) return 'deze-week';
  if (date < mondayAfterNext) return 'volgende-week';
  return 'later';
}

export function groupActivities(activities: Activity[]): ActivityGroupSection[] {
  const today = new Date();

  const buckets: Record<GroupKey, Activity[]> = {
    eerder: [],
    'deze-week': [],
    'volgende-week': [],
    later: [],
  };

  for (const activity of activities) {
    buckets[getGroupKey(activity.deadline, today)].push(activity);
  }

  return groupOrder
    .filter((key) => buckets[key].length > 0)
    .map((key) => ({
      groupKey: key,
      ...groupMeta[key],
      items: buckets[key],
    }));
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
cd frontend && pnpm exec vitest run src/utils/activity-grouping.test.ts 2>&1 | tail -20
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/utils/activity-grouping.ts frontend/src/utils/activity-grouping.test.ts
git commit -m "feat(utils): add groupActivities utility with nl-NL deadline formatting"
```

---

## Task 4: LayoutContext extension

**Files:**
- Modify: `frontend/src/context/layout-context.ts`
- Modify: `frontend/src/context/LayoutProvider.tsx`

- [ ] **Step 1: Update `frontend/src/context/layout-context.ts`**

```typescript
import { createContext } from 'react';

export type LayoutTab = 'chat' | 'activities' | 'challenge' | 'competenties' | 'stappenplan';

export type SidePanelContent = { type: 'activities' };

export type LayoutContextValue = {
  activeTab: LayoutTab;
  selectTab: (tab: LayoutTab) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (conversationId: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidePanelOpen: boolean;
  setSidePanelOpen: (open: boolean) => void;
  sidePanelContent: SidePanelContent | null;
  openSidePanel: (content: SidePanelContent) => void;
};

export const LayoutContext = createContext<LayoutContextValue | null>(null);
```

- [ ] **Step 2: Update `frontend/src/context/LayoutProvider.tsx`**

```typescript
import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import {
  LayoutContext,
  type LayoutContextValue,
  type LayoutTab,
  type SidePanelContent,
} from '@/context/layout-context';

export function LayoutProvider({ children }: PropsWithChildren) {
  const [activeTab, setActiveTab] = useState<LayoutTab>('chat');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [sidePanelContent, setSidePanelContent] = useState<SidePanelContent | null>(null);

  const selectTab = useCallback((tab: LayoutTab) => {
    setActiveTab(tab);

    if (tab === 'activities') {
      setSidePanelOpen(true);
      setSidePanelContent({ type: 'activities' });
      return;
    }

    if (tab !== 'chat') {
      setSidePanelOpen(false);
    }
  }, []);

  const openSidePanel = useCallback((content: SidePanelContent) => {
    setSidePanelContent(content);
    setSidePanelOpen(true);
  }, []);

  const value = useMemo<LayoutContextValue>(
    () => ({
      activeTab,
      selectTab,
      selectedConversationId,
      setSelectedConversationId,
      sidebarOpen,
      setSidebarOpen,
      sidePanelOpen,
      setSidePanelOpen,
      sidePanelContent,
      openSidePanel,
    }),
    [activeTab, selectTab, selectedConversationId, sidebarOpen, sidePanelOpen, sidePanelContent, openSidePanel],
  );

  return <LayoutContext value={value}>{children}</LayoutContext>;
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd frontend && pnpm exec tsc --noEmit 2>&1 | grep "layout-context\|LayoutProvider" | head -10
```

Expected: no errors on these files.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/context/layout-context.ts frontend/src/context/LayoutProvider.tsx
git commit -m "feat(context): add sidePanelContent and openSidePanel to LayoutContext"
```

---

## Task 5: SidePanel shell + ActivitiesPanel + registry

**Files:**
- Create: `frontend/src/layouts/side-panel/panel-registry.ts`
- Create: `frontend/src/layouts/side-panel/ActivitiesPanel.tsx`
- Modify: `frontend/src/layouts/SidePanel.tsx`
- Modify: `frontend/src/layouts/side-panel/constants.ts`

- [ ] **Step 1: Create `frontend/src/layouts/side-panel/ActivitiesPanel.tsx`**

This is the current `SidePanel.tsx` logic moved here, with `useQuery` replacing `useState` for activities:

```typescript
import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { activitiesQueryOptions } from '@/api/activities';
import { groupActivities } from '@/utils/activity-grouping';
import { ActivityDetails } from './ActivityDetails';
import { ActivityMenus } from './ActivityMenus';
import { ActivityTimeline } from './ActivityTimeline';
import type { ActivityGroupSection, OpenSubmenu } from './types';
import type { Activity, ActivityStatus, ActivityType } from '@/types/activity';

export function ActivitiesPanel() {
  const { data: activities = [] } = useQuery(activitiesQueryOptions);

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuActivityId, setMenuActivityId] = useState<string | null>(null);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<HTMLElement | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<OpenSubmenu>(null);

  // Local overrides for status/type changes (optimistic UI until mutations are added)
  const [localOverrides, setLocalOverrides] = useState<
    Record<string, Partial<Pick<Activity, 'status' | 'type'>>>
  >({});

  const mergedActivities = useMemo(
    () =>
      activities.map((a) =>
        localOverrides[a.id] ? { ...a, ...localOverrides[a.id] } : a,
      ),
    [activities, localOverrides],
  );

  const groupedActivities: ActivityGroupSection[] = useMemo(
    () => groupActivities(mergedActivities),
    [mergedActivities],
  );

  const selectedActivity =
    mergedActivities.find((a) => a.id === selectedActivityId) ?? null;

  const closeMenus = () => {
    setMenuAnchorEl(null);
    setMenuActivityId(null);
    setSubmenuAnchorEl(null);
    setOpenSubmenu(null);
  };

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>, activityId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuActivityId(activityId);
    setSubmenuAnchorEl(null);
    setOpenSubmenu(null);
  };

  const handleOpenSubmenu = (
    event: MouseEvent<HTMLElement>,
    submenu: Exclude<OpenSubmenu, null>,
  ) => {
    event.stopPropagation();
    setSubmenuAnchorEl(event.currentTarget);
    setOpenSubmenu(submenu);
  };

  const handleStatusChange = (status: ActivityStatus) => {
    if (!menuActivityId) return;
    setLocalOverrides((prev) => ({
      ...prev,
      [menuActivityId]: { ...prev[menuActivityId], status },
    }));
    closeMenus();
  };

  const handleTypeChange = (nextType: ActivityType) => {
    if (!menuActivityId) return;
    setLocalOverrides((prev) => ({
      ...prev,
      [menuActivityId]: { ...prev[menuActivityId], type: nextType },
    }));
    closeMenus();
  };

  const handleSelectActivity = (activityId: string) => {
    setSelectedActivityId(activityId);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, activityId: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if ((event.target as HTMLElement).closest('button,[role="button"]')) return;
    event.preventDefault();
    handleSelectActivity(activityId);
  };

  const closeSubmenu = () => {
    setSubmenuAnchorEl(null);
    setOpenSubmenu(null);
  };

  return (
    <>
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6">Activiteiten</Typography>
        <Typography variant="body2" color="text.secondary">
          Tijdlijn van activiteiten en deadlines rond deze student.
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, py: 1.5 }}>
        <Stack spacing={2}>
          <ActivityTimeline
            groups={groupedActivities}
            selectedActivityId={selectedActivityId}
            menuActivityId={menuActivityId}
            menuAnchorEl={menuAnchorEl}
            onSelectActivity={handleSelectActivity}
            onCardKeyDown={handleCardKeyDown}
            onOpenMenu={handleOpenMenu}
          />
        </Stack>
      </Box>

      <Collapse in={!!selectedActivity} timeout="auto" unmountOnExit>
        {selectedActivity ? (
          <ActivityDetails
            activity={selectedActivity}
            onClose={() => { setSelectedActivityId(null); }}
          />
        ) : null}
      </Collapse>

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Button fullWidth variant="contained" startIcon={<AddIcon />}>
          Nieuwe activiteit
        </Button>
      </Box>

      <ActivityMenus
        activities={mergedActivities}
        menuActivityId={menuActivityId}
        menuAnchorEl={menuAnchorEl}
        submenuAnchorEl={submenuAnchorEl}
        openSubmenu={openSubmenu}
        onCloseMenus={closeMenus}
        onOpenSubmenu={handleOpenSubmenu}
        onCloseSubmenu={closeSubmenu}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
```

- [ ] **Step 2: Create `frontend/src/layouts/side-panel/panel-registry.ts`**

```typescript
import type { ComponentType } from 'react';
import { ActivitiesPanel } from './ActivitiesPanel';

export const PANEL_REGISTRY: Record<string, ComponentType> = {
  activities: ActivitiesPanel,
};
```

- [ ] **Step 3: Refactor `frontend/src/layouts/SidePanel.tsx` to pure shell**

Replace the entire file:

```typescript
import Box from '@mui/material/Box';
import { useLayout } from '@/context/useLayout';
import { PANEL_REGISTRY } from '@/layouts/side-panel/panel-registry';
import { panelWidth } from '@/layouts/side-panel/constants';

export function SidePanel() {
  const { sidePanelOpen, sidePanelContent } = useLayout();
  const Panel = sidePanelContent ? PANEL_REGISTRY[sidePanelContent.type] : null;

  return (
    <Box
      sx={{
        width: sidePanelOpen ? panelWidth : 0,
        minWidth: sidePanelOpen ? panelWidth : 0,
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width 0.2s ease',
        borderLeft: sidePanelOpen ? '1px solid' : '0 solid transparent',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: panelWidth,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          bgcolor: 'background.paper',
        }}
      >
        {Panel ? <Panel /> : null}
      </Box>
    </Box>
  );
}
```

- [ ] **Step 4: Remove `initialActivities` from `frontend/src/layouts/side-panel/constants.ts`**

Delete the `initialActivities` export and its import of `ActivityItem`. The rest of the file (panelWidth, groupMeta, groupOrder, statusMeta, typeLabelMap, subtypeOptions, statusOptions, getTypeLabel, getActionLabel) stays unchanged. Remove the `ActivityItem` import at the top.

The updated imports section at the top of `constants.ts`:

```typescript
import type { ActivityStatus, ActivityType, GroupKey } from '@/types/activity';
```

Remove the `ActivityItem` import and the entire `initialActivities` constant.

- [ ] **Step 5: Verify TypeScript**

```bash
cd frontend && pnpm exec tsc --noEmit 2>&1 | head -40
```

Expected: errors only from files not yet updated in this task (ActivityDetails, ActivityMenus, ActivityTimeline, ActivityCard). Those are fixed in Task 6.

- [ ] **Step 6: Commit**

```bash
git add \
  frontend/src/layouts/side-panel/ActivitiesPanel.tsx \
  frontend/src/layouts/side-panel/panel-registry.ts \
  frontend/src/layouts/SidePanel.tsx \
  frontend/src/layouts/side-panel/constants.ts
git commit -m "feat(sidepanel): refactor to generic shell with registry, extract ActivitiesPanel"
```

---

## Task 6: Update sub-components for Activity type

**Files:**
- Modify: `frontend/src/layouts/side-panel/ActivityCard.tsx`
- Modify: `frontend/src/layouts/side-panel/ActivityTimeline.tsx`
- Modify: `frontend/src/layouts/side-panel/ActivityDetails.tsx`
- Modify: `frontend/src/layouts/side-panel/ActivityMenus.tsx`

- [ ] **Step 1: Update `ActivityCard.tsx`**

Add `deadlineLabel: string` prop and replace `activity.deadlineLabel` with it. Change `ActivityItem` import to `Activity`:

```typescript
import type { KeyboardEvent, MouseEvent } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Activity } from '@/types/activity';

type ActivityCardProps = {
  activity: Activity;
  deadlineLabel: string;
  isSelected: boolean;
  menuOpen: boolean;
  statusColor: string;
  statusLabel: string;
  typeLabel: string;
  onSelect: (activityId: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>, activityId: string) => void;
  onOpenMenu: (event: MouseEvent<HTMLButtonElement>, activityId: string) => void;
};

export function ActivityCard({
  activity,
  deadlineLabel,
  isSelected,
  menuOpen,
  statusColor,
  statusLabel,
  typeLabel,
  onSelect,
  onKeyDown,
  onOpenMenu,
}: ActivityCardProps) {
  return (
    <Paper
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => { onSelect(activity.id); }}
      onKeyDown={(event) => { onKeyDown(event, activity.id); }}
      elevation={isSelected ? 4 : 1}
      sx={(theme) => ({
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${statusColor}`,
        borderRadius: 2,
        p: 1.5,
        pr: 6,
        cursor: 'pointer',
        outline: 'none',
        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
        boxShadow: isSelected
          ? theme.shadows[4]
          : '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        transition: 'background-color 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
        '&:hover': { boxShadow: theme.shadows[2] },
        '&:focus-visible': {
          boxShadow: `${theme.shadows[2]}, 0 0 0 3px ${alpha(theme.palette.primary.main, 0.34)}`,
        },
      })}
    >
      <IconButton
        size="small"
        aria-label={`Open menu voor ${activity.title}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={(event) => { onOpenMenu(event, activity.id); }}
        sx={{ position: 'absolute', top: 8, right: 8 }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Stack spacing={1.25}>
        <Chip label={typeLabel} color="primary" size="small" sx={{ alignSelf: 'flex-start' }} />

        <Typography variant="subtitle2" sx={{ pr: 1.5 }}>
          {activity.title}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 1,
            minHeight: 34,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {deadlineLabel}
          </Typography>
          <Typography variant="body2" sx={{ color: statusColor, fontWeight: 600, textAlign: 'right' }}>
            {statusLabel}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
```

- [ ] **Step 2: Update `ActivityTimeline.tsx`**

Compute `deadlineLabel` per activity and pass it to `ActivityCard`. Update the `ActivityGroupSection` import (already updated in Task 1, but `ActivityItem` usage inside the component goes away):

```typescript
import type { KeyboardEvent, MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { formatDeadlineLabel } from '@/utils/activity-grouping';
import { ActivityCard } from './ActivityCard';
import { getTypeLabel, statusMeta } from './constants';
import type { ActivityGroupSection } from './types';
import type { Activity } from '@/types/activity';

type ActivityTimelineProps = {
  groups: ActivityGroupSection[];
  selectedActivityId: string | null;
  menuActivityId: string | null;
  menuAnchorEl: HTMLElement | null;
  onSelectActivity: (activityId: string) => void;
  onCardKeyDown: (event: KeyboardEvent<HTMLDivElement>, activityId: string) => void;
  onOpenMenu: (event: MouseEvent<HTMLButtonElement>, activityId: string) => void;
};

export function ActivityTimeline({
  groups,
  selectedActivityId,
  menuActivityId,
  menuAnchorEl,
  onSelectActivity,
  onCardKeyDown,
  onOpenMenu,
}: ActivityTimelineProps) {
  return groups.map((group) => (
    <Box key={group.groupKey}>
      <Divider sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: '100%',
            px: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            {group.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {group.rangeLabel}
          </Typography>
        </Box>
      </Divider>

      <Timeline
        sx={{
          m: 0,
          p: 0,
          [`& .MuiTimelineItem-root:before`]: { flex: 0, padding: 0 },
        }}
      >
        {group.items.map((activity: Activity, index) => {
          const isSelected = selectedActivityId === activity.id;
          const status = statusMeta[activity.status];

          return (
            <TimelineItem key={activity.id} sx={{ alignItems: 'stretch', minHeight: 0 }}>
              <TimelineSeparator sx={{ minWidth: 20 }}>
                <TimelineDot
                  sx={{
                    m: 0,
                    mt: 1.5,
                    boxShadow: 'none',
                    border: 'none',
                    bgcolor: status.color,
                    width: 10,
                    height: 10,
                  }}
                />
                {index < group.items.length - 1 ? (
                  <TimelineConnector
                    sx={{ bgcolor: alpha('#1976d2', 0.14), width: 2, borderRadius: 999 }}
                  />
                ) : null}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 0.5, pr: 0 }}>
                <ActivityCard
                  activity={activity}
                  deadlineLabel={formatDeadlineLabel(activity.deadline)}
                  isSelected={isSelected}
                  menuOpen={menuActivityId === activity.id && Boolean(menuAnchorEl)}
                  statusColor={status.color}
                  statusLabel={status.label}
                  typeLabel={getTypeLabel(activity.type)}
                  onSelect={onSelectActivity}
                  onKeyDown={onCardKeyDown}
                  onOpenMenu={onOpenMenu}
                />
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Box>
  ));
}
```

- [ ] **Step 3: Update `ActivityDetails.tsx`**

Change `ActivityItem` to `Activity`. Replace `activity.deadlineLabel` with `formatDeadlineLabel(activity.deadline)`. Handle nullable `description` and `competencyLabel`:

```typescript
import CloseIcon from '@mui/icons-material/Close';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Activity } from '@/types/activity';
import { formatDeadlineLabel } from '@/utils/activity-grouping';
import { getActionLabel, getTypeLabel, statusMeta } from './constants';

type ActivityDetailsProps = {
  activity: Activity;
  onClose: () => void;
};

export function ActivityDetails({ activity, onClose }: ActivityDetailsProps) {
  return (
    <Box
      sx={{
        px: 2,
        pt: 1.25,
        pb: 1.75,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: alpha('#1976d2', 0.015),
      }}
    >
      <Box sx={{ minHeight: 260, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Chip label={getTypeLabel(activity.type)} color="primary" size="small" />
          <IconButton
            size="small"
            aria-label="Sluit detailweergave"
            onClick={() => { onClose(); }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {activity.title}
        </Typography>

        {activity.description ? (
          <Typography variant="body2" color="text.secondary">
            {activity.description}
          </Typography>
        ) : null}

        <Stack spacing={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TodayOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2">
              Deadline: {formatDeadlineLabel(activity.deadline)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlagOutlinedIcon sx={{ fontSize: 18, color: statusMeta[activity.status].color }} />
            <Typography variant="body2">
              Status: {statusMeta[activity.status].label}
            </Typography>
          </Box>

          {activity.competencyLabel ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2">
                Gekoppelde competentie: {activity.competencyLabel}
              </Typography>
            </Box>
          ) : null}
        </Stack>

        <Button sx={{ mt: 'auto' }} variant="contained" fullWidth>
          {getActionLabel(activity.type)}
        </Button>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 4: Update `ActivityMenus.tsx`**

Change `ActivityItem` to `Activity` in the prop type and import:

```typescript
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import type { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import { statusMeta, statusOptions, subtypeOptions } from './constants';
import type { OpenSubmenu } from './types';

type ActivityMenusProps = {
  activities: Activity[];
  menuActivityId: string | null;
  menuAnchorEl: HTMLElement | null;
  submenuAnchorEl: HTMLElement | null;
  openSubmenu: OpenSubmenu;
  onCloseMenus: () => void;
  onOpenSubmenu: (event: React.MouseEvent<HTMLElement>, submenu: 'type' | 'status') => void;
  onCloseSubmenu: () => void;
  onTypeChange: (nextType: ActivityType) => void;
  onStatusChange: (status: ActivityStatus) => void;
};

export function ActivityMenus({
  activities,
  menuActivityId,
  menuAnchorEl,
  submenuAnchorEl,
  openSubmenu,
  onCloseMenus,
  onOpenSubmenu,
  onCloseSubmenu,
  onTypeChange,
  onStatusChange,
}: ActivityMenusProps) {
  const activity = activities.find((item) => item.id === menuActivityId);

  return (
    <>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={onCloseMenus}
        slotProps={{ list: { 'aria-label': 'Activiteitenkaart acties' } }}
      >
        <MenuItem onClick={onCloseMenus}>Hernoem titel</MenuItem>
        <MenuItem onClick={onCloseMenus}>Bewerk</MenuItem>
        <MenuItem onClick={(event) => { onOpenSubmenu(event, 'type'); }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2 }}>
            Verander soort
            <ChevronRightIcon fontSize="small" />
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={(event) => { onOpenSubmenu(event, 'status'); }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 2 }}>
            Markeer als...
            <ChevronRightIcon fontSize="small" />
          </Box>
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={submenuAnchorEl}
        open={Boolean(submenuAnchorEl && openSubmenu)}
        onClose={onCloseSubmenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {openSubmenu === 'type'
          ? subtypeOptions.map((option) => (
              <MenuItem key={option.value} onClick={() => { onTypeChange(option.value); }}>
                {option.label}
              </MenuItem>
            ))
          : null}

        {openSubmenu === 'status'
          ? statusOptions.map((status) => (
              <MenuItem
                key={status}
                selected={activity?.status === status}
                onClick={() => { onStatusChange(status); }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    mr: 1.25,
                    borderRadius: '50%',
                    bgcolor: statusMeta[status].color,
                    flexShrink: 0,
                  }}
                />
                {statusMeta[status].label}
              </MenuItem>
            ))
          : null}
      </Menu>
    </>
  );
}
```

- [ ] **Step 5: Verify TypeScript compiles clean**

```bash
cd frontend && pnpm exec tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add \
  frontend/src/layouts/side-panel/ActivityCard.tsx \
  frontend/src/layouts/side-panel/ActivityTimeline.tsx \
  frontend/src/layouts/side-panel/ActivityDetails.tsx \
  frontend/src/layouts/side-panel/ActivityMenus.tsx
git commit -m "refactor(sidepanel): update sub-components to use Activity type"
```

---

## Task 7: Update LayoutStoryProvider and ChatTab stories

**Files:**
- Modify: `frontend/src/storybook/LayoutStoryProvider.tsx`
- Modify: `frontend/src/tabs/chat/ChatTab.stories.tsx`

- [ ] **Step 1: Update `frontend/src/storybook/LayoutStoryProvider.tsx`**

```typescript
import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import {
  LayoutContext,
  type LayoutContextValue,
  type LayoutTab,
  type SidePanelContent,
} from '@/context/layout-context';

type LayoutStoryProviderProps = PropsWithChildren<{
  activeTab?: LayoutTab;
  sidebarOpen?: boolean;
  sidePanelOpen?: boolean;
  sidePanelContent?: SidePanelContent | null;
}>;

export function LayoutStoryProvider({
  activeTab: initialActiveTab = 'chat',
  sidebarOpen: initialSidebarOpen = true,
  sidePanelOpen: initialSidePanelOpen = false,
  sidePanelContent: initialSidePanelContent = null,
  children,
}: LayoutStoryProviderProps) {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);
  const [sidePanelOpen, setSidePanelOpen] = useState(initialSidePanelOpen);
  const [sidePanelContent, setSidePanelContent] = useState<SidePanelContent | null>(
    initialSidePanelContent,
  );

  const selectTab = useCallback((tab: LayoutTab) => {
    setActiveTab(tab);
    if (tab === 'activities') {
      setSidePanelOpen(true);
      setSidePanelContent({ type: 'activities' });
      return;
    }
    if (tab !== 'chat') setSidePanelOpen(false);
  }, []);

  const openSidePanel = useCallback((content: SidePanelContent) => {
    setSidePanelContent(content);
    setSidePanelOpen(true);
  }, []);

  const value = useMemo<LayoutContextValue>(
    () => ({
      activeTab,
      selectTab,
      selectedConversationId,
      setSelectedConversationId,
      sidebarOpen,
      setSidebarOpen,
      sidePanelOpen,
      setSidePanelOpen,
      sidePanelContent,
      openSidePanel,
    }),
    [activeTab, selectTab, selectedConversationId, sidebarOpen, sidePanelOpen, sidePanelContent, openSidePanel],
  );

  return <LayoutContext value={value}>{children}</LayoutContext>;
}
```

- [ ] **Step 2: Update `frontend/src/tabs/chat/ChatTab.stories.tsx`**

Update `SidePanelOpen` story to pass a content type. Move the student fixture to a named constant:

```typescript
import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { studentProfileOptions, type StudentProfile } from '@/api/student';
import { LayoutStoryProvider } from '@/storybook/LayoutStoryProvider';
import { ChatTab } from './ChatTab';

const meta: Meta<typeof ChatTab> = {
  title: 'Tabs/ChatTab',
  component: ChatTab,
};

export default meta;
type Story = StoryObj<typeof ChatTab>;

const MOCK_STUDENT: StudentProfile = {
  id: 'student-1',
  canvasUserId: '31474',
  displayName: 'Hest, Jan J.H. van',
  email: 'jan.vanhest@student.fontys.nl',
  avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
  createdAt: '2026-05-19T00:00:00.000Z',
};

function ChatFrame({
  sidePanelOpen = false,
  children,
}: {
  sidePanelOpen?: boolean;
  children: ReactNode;
}) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(studentProfileOptions.queryKey, MOCK_STUDENT);

  return (
    <QueryClientProvider client={queryClient}>
      <LayoutStoryProvider
        sidePanelOpen={sidePanelOpen}
        sidePanelContent={sidePanelOpen ? { type: 'activities' } : null}
      >
        <Box sx={{ height: 640, display: 'flex', flexDirection: 'column' }}>{children}</Box>
      </LayoutStoryProvider>
    </QueryClientProvider>
  );
}

export const Default: Story = {
  render: () => (
    <ChatFrame>
      <ChatTab />
    </ChatFrame>
  ),
};

export const SidePanelOpen: Story = {
  render: () => (
    <ChatFrame sidePanelOpen>
      <ChatTab />
    </ChatFrame>
  ),
};
```

- [ ] **Step 3: Verify TypeScript compiles clean**

```bash
cd frontend && pnpm exec tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add \
  frontend/src/storybook/LayoutStoryProvider.tsx \
  frontend/src/tabs/chat/ChatTab.stories.tsx
git commit -m "fix(storybook): update LayoutStoryProvider and ChatTab stories for sidePanelContent"
```

---

## Task 8: Cleanup — move sidebarTitle and topbar files

**Files:**
- Move: `layouts/sidebarTitle.ts` → `utils/sidebarTitle.ts`
- Move: `layouts/sidebarTitle.test.ts` → `utils/sidebarTitle.test.ts`
- Move: `layouts/Topbar.tsx` → `layouts/topbar/Topbar.tsx`
- Move: `layouts/Topbar.stories.tsx` → `layouts/topbar/Topbar.stories.tsx`
- Move: `layouts/StudentMenu.tsx` → `layouts/topbar/StudentMenu.tsx`

- [ ] **Step 1: Move sidebarTitle files**

```bash
mv frontend/src/layouts/sidebarTitle.ts frontend/src/utils/sidebarTitle.ts
mv frontend/src/layouts/sidebarTitle.test.ts frontend/src/utils/sidebarTitle.test.ts
```

- [ ] **Step 2: Update imports for sidebarTitle**

Find all files that import from `@/layouts/sidebarTitle` or `./sidebarTitle` (relative to layouts/):

```bash
grep -r "sidebarTitle" frontend/src --include="*.ts" --include="*.tsx" -l
```

For each result, update the import path to `@/utils/sidebarTitle`.

- [ ] **Step 3: Verify sidebarTitle tests still pass**

```bash
cd frontend && pnpm exec vitest run src/utils/sidebarTitle.test.ts 2>&1 | tail -10
```

Expected: all tests PASS.

- [ ] **Step 4: Move Topbar files into subfolder**

```bash
mkdir -p frontend/src/layouts/topbar
mv frontend/src/layouts/Topbar.tsx frontend/src/layouts/topbar/Topbar.tsx
mv frontend/src/layouts/Topbar.stories.tsx frontend/src/layouts/topbar/Topbar.stories.tsx
mv frontend/src/layouts/StudentMenu.tsx frontend/src/layouts/topbar/StudentMenu.tsx
```

- [ ] **Step 5: Update imports for Topbar and StudentMenu**

```bash
grep -r "layouts/Topbar\|from.*Topbar\|from.*StudentMenu" frontend/src --include="*.ts" --include="*.tsx" -l
```

Update each import to point to the new path (e.g. `@/layouts/topbar/Topbar`).

- [ ] **Step 6: Verify TypeScript compiles clean**

```bash
cd frontend && pnpm exec tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(layouts): move sidebarTitle to utils/, group Topbar files in topbar/"
```

---

## Done

After Task 8, the SidePanel is wired to the real backend, the architecture is generic, and the codebase structure is clean. The `openSidePanel({ type: 'activities' })` hook is ready to be called from the chat tab or SSE handler whenever that UX is designed.
