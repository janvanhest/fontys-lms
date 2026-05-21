import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateMessageId } from './chatStreamHelpers';

describe('generateMessageId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses randomUUID when crypto supports it', () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'uuid-123'),
    });

    expect(generateMessageId('assistant')).toBe('assistant-uuid-123');
  });

  it('falls back to a random suffix without using time-based counters', () => {
    vi.stubGlobal('crypto', undefined);
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.123456789);

    expect(generateMessageId('user')).toBe('user-4fzzzxjylrx');
    expect(randomSpy).toHaveBeenCalledOnce();
  });
});
