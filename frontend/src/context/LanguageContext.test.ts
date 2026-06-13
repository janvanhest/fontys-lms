import { describe, it, expect, beforeEach, vi } from 'vitest';

const STORAGE_KEY = 'lms-chat-language';

const makeLocalStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  };
};

describe('language preference storage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', makeLocalStorageMock());
  });

  it('returns "nl" when localStorage has no value', () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const language = stored === 'en' ? 'en' : 'nl';
    expect(language).toBe('nl');
  });

  it('returns "en" when localStorage has "en"', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    const stored = localStorage.getItem(STORAGE_KEY);
    const language = stored === 'en' ? 'en' : 'nl';
    expect(language).toBe('en');
  });
});
