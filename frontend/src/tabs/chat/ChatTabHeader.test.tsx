import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChatTabHeader } from './ChatTabHeader';

describe('ChatTabHeader', () => {
  it('renders a compact status chip when a live status is present', () => {
    const html = renderToStaticMarkup(
      <ChatTabHeader
        activeTab="chat"
        isLoadingHistory={false}
        onToggleActivities={() => {}}
        sidePanelOpen={false}
        status={{ label: 'Activiteiten bekijken...', icon: 'activities' }}
      />,
    );

    expect(html).toContain('Activiteiten bekijken...');
    expect(html).toContain('MuiChip-root');
  });

  it('falls back to the default subtitle when no status is active', () => {
    const html = renderToStaticMarkup(
      <ChatTabHeader
        activeTab="chat"
        isLoadingHistory={false}
        onToggleActivities={() => {}}
        sidePanelOpen={false}
        status={null}
      />,
    );

    expect(html).toContain('Stel een vraag over je challenge, activiteiten of cursusinhoud.');
    expect(html).not.toContain('MuiChip-root');
  });
});
