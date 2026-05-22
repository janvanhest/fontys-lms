import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatMarkdownComponents } from './chatMarkdownComponents';

describe('chatMarkdownComponents', () => {
  it('renders markdown tables inside a styled container with visible grid treatment', () => {
    const html = renderToStaticMarkup(
      <Markdown remarkPlugins={[remarkGfm]} components={chatMarkdownComponents}>
        {`| Activiteit | Status |\n| --- | --- |\n| Vragenlijst | Bezig |`}
      </Markdown>,
    );

    expect(html).toContain('Vragenlijst');
    expect(html).toContain('overflow-x:auto');
    expect(html).toContain('border-collapse:separate');
    expect(html).toContain('tbody tr:nth-of-type(even)');
  });

  it('does not wrap list item block content inside a span typography element', () => {
    const html = renderToStaticMarkup(
      <Markdown remarkPlugins={[remarkGfm]} components={chatMarkdownComponents}>
        {`- Eerste alinea\n\n  Tweede alinea`}
      </Markdown>,
    );

    expect(html).toContain('<li');
    expect(html).not.toContain('<span class="MuiTypography-root');
    expect(html).toContain('<p class="MuiTypography-root');
  });
});
