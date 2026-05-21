import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { SidePanelContent } from '@/context/layout-context';
import type { Activity } from '@/types/activity';
import { ActivitiesPanel } from './ActivitiesPanel';
import { PANEL_REGISTRY } from './panel-registry';

const useQueryMock = vi.fn();

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();

  return {
    ...actual,
    useQuery: (...args: unknown[]) => useQueryMock(...args),
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

vi.mock('./ActivityMenus', () => ({
  ActivityMenus: () => null,
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
  it('renders a loading state while activities are being fetched', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    const html = renderToStaticMarkup(<ActivitiesPanel />);

    expect(html).toContain('Activiteiten laden');
    expect(html).not.toContain('data-testid="activity-timeline"');
  });

  it('renders an error state when the query fails', () => {
    useQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Kon activiteiten niet ophalen'),
    });

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
