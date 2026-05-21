import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateMessageId, getStatusTextFromToolCall } from './chatStreamHelpers';

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

describe('getStatusTextFromToolCall', () => {
  it('returns the activity lookup status for search_activities', () => {
    expect(getStatusTextFromToolCall(JSON.stringify({ name: 'search_activities' }))).toBe(
      'Activiteiten raadplegen...',
    );
  });

  it('preserves the source lookup status for search_course_content', () => {
    expect(getStatusTextFromToolCall(JSON.stringify({ name: 'search_course_content' }))).toBe(
      'Bronnen raadplegen...',
    );
  });

  it('returns the generic context status for unknown tools', () => {
    expect(getStatusTextFromToolCall(JSON.stringify({ name: 'unknown_tool' }))).toBe(
      'Extra context ophalen...',
    );
  });
});
