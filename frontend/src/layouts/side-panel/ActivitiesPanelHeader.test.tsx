import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { useLayout } from '@/context/useLayout';
import { ActivitiesPanelHeader } from './ActivitiesPanelHeader';

vi.mock('@/context/useLayout', () => ({
  useLayout: vi.fn(),
}));

describe('ActivitiesPanelHeader', () => {
  it('rendert een sluitknop met aria-label', () => {
    vi.mocked(useLayout).mockReturnValue({
      closeSidePanel: vi.fn(),
    } as unknown as ReturnType<typeof useLayout>);

    const html = renderToStaticMarkup(<ActivitiesPanelHeader />);

    expect(html).toContain('aria-label="Sluit activiteiten"');
  });

  it('rendert de titel en ondertitel', () => {
    vi.mocked(useLayout).mockReturnValue({
      closeSidePanel: vi.fn(),
    } as unknown as ReturnType<typeof useLayout>);

    const html = renderToStaticMarkup(<ActivitiesPanelHeader />);

    expect(html).toContain('Activiteiten');
    expect(html).toContain('Tijdlijn van activiteiten en deadlines');
  });
});
