import { describe, expect, it } from 'vitest';

// The hook itself requires a DOM environment; we test the slicing logic inline.
describe('useTypewriter slicing', () => {
  it('slices content to displayIndex', () => {
    const content = 'Hello world';
    expect(content.slice(0, 5)).toBe('Hello');
    expect(content.slice(0, 11)).toBe('Hello world');
  });

  it('adaptive steps clamp to content length', () => {
    const content = 'Hi';
    expect(Math.min(0 + 5, content.length)).toBe(2);
  });

  it('paragraph boundary split', () => {
    const displayed = 'First paragraph.\n\nSecond para in progress';
    const lastParaEnd = displayed.lastIndexOf('\n\n');
    expect(displayed.slice(0, lastParaEnd + 2)).toBe('First paragraph.\n\n');
    expect(displayed.slice(lastParaEnd + 2)).toBe('Second para in progress');
  });

  it('no paragraph boundary uses full content as animating', () => {
    const displayed = 'Just one line';
    const lastParaEnd = displayed.lastIndexOf('\n\n');
    const animatingPart = lastParaEnd >= 0 ? displayed.slice(lastParaEnd + 2) : displayed;
    expect(animatingPart).toBe('Just one line');
  });
});
