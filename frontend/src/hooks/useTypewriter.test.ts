import { describe, expect, it } from 'vitest';
import { advanceToWordBoundary } from './useTypewriter';

describe('advanceToWordBoundary', () => {
  it('advances past the first word and its trailing space', () => {
    // "hello world" → past 'hello' and space → index 6
    expect(advanceToWordBoundary('hello world', 0, 1)).toBe(6);
  });

  it('skips leading boundary then advances past next word', () => {
    // fromIndex=5 is a space → skip it, advance past 'world', include trailing space → 12
    expect(advanceToWordBoundary('hello world foo', 5, 1)).toBe(12);
  });

  it('advances multiple steps', () => {
    // 'one two three': step1 → after 'one ' (4), step2 → after 'two ' (8)
    expect(advanceToWordBoundary('one two three', 0, 2)).toBe(8);
  });

  it('stops at end of content when no trailing boundary exists', () => {
    expect(advanceToWordBoundary('hello', 0, 1)).toBe(5);
  });

  it('returns content.length when already at end', () => {
    expect(advanceToWordBoundary('hello', 5, 1)).toBe(5);
  });

  it('treats dots as boundaries', () => {
    // 'Hello.World' → 'Hello' ends at 5, '.' included → index 6
    expect(advanceToWordBoundary('Hello.World', 0, 1)).toBe(6);
  });

  it('treats newlines as boundaries', () => {
    // 'line one\n...' → 'line' at 0-3, ' ' at 4 included → index 5
    expect(advanceToWordBoundary('line one\nline two', 0, 1)).toBe(5);
  });

  it('advances 3 steps', () => {
    // 'a b c d e': a→2, b→4, c→6
    expect(advanceToWordBoundary('a b c d e', 0, 3)).toBe(6);
  });
});
