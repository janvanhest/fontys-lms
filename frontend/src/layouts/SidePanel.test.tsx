import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { useLayout } from '@/context/useLayout';
import { SidePanel } from './SidePanel';

vi.mock('@/context/useLayout', () => ({
  useLayout: vi.fn(),
}));

vi.mock('@/layouts/side-panel/panel-registry', () => ({
  PANEL_REGISTRY: {
    activities: () => null,
  },
}));

describe('SidePanel', () => {
  it('toont het randtabje als het panel gesloten is', () => {
    vi.mocked(useLayout).mockReturnValue({
      sidePanelOpen: false,
      sidePanelContent: null,
      openSidePanel: vi.fn(),
      closeSidePanel: vi.fn(),
    } as unknown as ReturnType<typeof useLayout>);

    const html = renderToStaticMarkup(<SidePanel />);

    expect(html).toContain('aria-label="Open activiteiten"');
  });

  it('verbergt het randtabje als het panel open is', () => {
    vi.mocked(useLayout).mockReturnValue({
      sidePanelOpen: true,
      sidePanelContent: { type: 'activities' },
      openSidePanel: vi.fn(),
      closeSidePanel: vi.fn(),
    } as unknown as ReturnType<typeof useLayout>);

    const html = renderToStaticMarkup(<SidePanel />);

    expect(html).not.toContain('aria-label="Open activiteiten"');
  });
});
