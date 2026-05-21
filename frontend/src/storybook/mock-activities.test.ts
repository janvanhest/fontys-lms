import { afterEach, describe, expect, it, vi } from 'vitest';
import { isoDate } from './mock-activities';

describe('isoDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('computes Monday-relative dates in UTC', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-24T23:30:00-07:00'));

    expect(isoDate(0)).toBe('2026-05-25');
    expect(isoDate(10)).toBe('2026-06-04');
  });
});
