import { describe, expect, it } from 'vitest';
import { formatConversationTitle, normalizeConversationTitleInput } from './sidebarTitle';

describe('sidebarTitle helpers', () => {
  it('uses the stored title when present', () => {
    expect(
      formatConversationTitle({
        createdAt: '2026-05-19T00:24:00.000Z',
        title: 'Semesterplan hulp',
      }),
    ).toBe('Semesterplan hulp');
  });

  it('falls back to a formatted timestamp when no title exists', () => {
    expect(
      formatConversationTitle({
        createdAt: '2026-05-19T00:24:00.000Z',
      }),
    ).toMatch(/19-05-2026|19-5-2026/);
  });

  it('trims valid title input and rejects empty values', () => {
    expect(normalizeConversationTitleInput('  Portflow plan  ')).toBe('Portflow plan');
    expect(normalizeConversationTitleInput('   ')).toBeNull();
  });
});
