import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { SidePanelContent } from '@/context/layout-context';
import type { Activity } from '@/types/activity';
import { useLayout } from '@/context/useLayout';
import { ActivitiesPanel } from './ActivitiesPanel';
import { PANEL_REGISTRY } from './panel-registry';

const useQueryMock = vi.fn();
const useUpdateActivityMock = vi.fn();

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actualModule = await importOriginal();

  return {
    ...(actualModule as Record<string, unknown>),
    useQuery: () =>
      useQueryMock() as {
        data?: Activity[];
        isLoading: boolean;
        isError: boolean;
        error: Error | null;
      },
  };
});

vi.mock('@/api/activities', async (importOriginal) => {
  const actualModule = await importOriginal();

  return {
    ...(actualModule as Record<string, unknown>),
    useUpdateActivity: () =>
      useUpdateActivityMock() as {
        mutate: (...args: unknown[]) => void;
      },
  };
});

vi.mock('./ActivityTimeline', () => ({
  ActivityTimeline: ({ groups }: { groups: Array<{ groupKey: string }> }) => (
    <div data-testid="activity-timeline">{groups.map((group) => group.groupKey).join(',')}</div>
  ),
}));

vi.mock('./ActivityDetails', () => ({
  ActivityDetails: () => <div data-testid="activity-details" />,
}));

vi.mock('./ActivityFormDialog', () => ({
  ActivityFormDialog: () => null,
}));

vi.mock('./ActivityMenus', () => ({
  ActivityMenus: () => null,
}));

vi.mock('@/context/useLayout', () => ({
  useLayout: vi.fn(),
}));

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'activity-1',
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

describe('ActivitiesPanel', () => {
  beforeEach(() => {
    vi.mocked(useLayout).mockReturnValue({
      highlightedActivityId: null,
    } as ReturnType<typeof useLayout>);
  });

  it('renders a loading state while activities are being fetched', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    useUpdateActivityMock.mockReturnValue({ mutate: vi.fn() });

    const html = renderToStaticMarkup(<ActivitiesPanel />);

    expect(html).toContain('MuiSkeleton-root');
    expect(html).not.toContain('data-testid="activity-timeline"');
  });

  it('renders an error state when the query fails', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Kon activiteiten niet ophalen'),
    });
    useUpdateActivityMock.mockReturnValue({ mutate: vi.fn() });

    const html = renderToStaticMarkup(<ActivitiesPanel />);

    expect(html).toContain('Kon activiteiten niet ophalen');
    expect(html).not.toContain('data-testid="activity-timeline"');
  });

  it('renders an empty state when no activities are returned', () => {
    useQueryMock.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    });
    useUpdateActivityMock.mockReturnValue({ mutate: vi.fn() });

    const html = renderToStaticMarkup(<ActivitiesPanel />);

    expect(html).toContain('Nog geen activiteiten');
    expect(html).not.toContain('data-testid="activity-timeline"');
  });

  it('renders the timeline when activities are available', () => {
    useQueryMock.mockReturnValue({
      data: [makeActivity()],
      isLoading: false,
      isError: false,
      error: null,
    });
    useUpdateActivityMock.mockReturnValue({ mutate: vi.fn() });

    const html = renderToStaticMarkup(<ActivitiesPanel />);

    expect(html).toContain('data-testid="activity-timeline"');
  });
});

describe('PANEL_REGISTRY', () => {
  it('stays keyed by the SidePanelContent type union', () => {
    const registry: Record<SidePanelContent['type'], unknown> = PANEL_REGISTRY;

    expect(registry.activities).toBe(ActivitiesPanel);
  });
});
