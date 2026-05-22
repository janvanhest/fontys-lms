import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { Activity } from '@/types/activity';
import { groupActivities, formatDeadlineLabel } from './activity-grouping';

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    id: 'test-id',
    portflowId: null,
    title: 'Test activiteit',
    description: null,
    position: 0,
    type: 'opdracht',
    status: 'open',
    deadline: null,
    competencyLabel: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Pin "today" to a known Wednesday so week bounds are deterministic
const WEDNESDAY_2026_05_20 = new Date('2026-05-20T12:00:00.000Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(WEDNESDAY_2026_05_20);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('formatDeadlineLabel', () => {
  it('returns an em dash for null deadline', () => {
    expect(formatDeadlineLabel(null)).toBe('—');
  });

  it('formats a date in Dutch short weekday + day + month', () => {
    // 2026-05-14 is a Thursday (do)
    const label = formatDeadlineLabel('2026-05-14');
    expect(label).toMatch(/do/i);
    expect(label).toMatch(/14/);
    expect(label).toMatch(/mei/i);
  });
});

describe('groupActivities — groupKey assignment', () => {
  it('assigns "eerder" to a deadline before this week', () => {
    // Monday of week 2026-05-20 is 2026-05-18 — so 2026-05-17 is last week
    const activity = makeActivity({ id: '1', deadline: '2026-05-17' });
    const groups = groupActivities([activity]);
    const eerder = groups.find((g) => g.groupKey === 'eerder');
    expect(eerder?.items).toHaveLength(1);
    expect(eerder?.items[0].id).toBe('1');
  });

  it('assigns "deze-week" to a deadline within this week', () => {
    // 2026-05-20 is Wednesday this week
    const activity = makeActivity({ id: '2', deadline: '2026-05-20' });
    const groups = groupActivities([activity]);
    const thisWeek = groups.find((g) => g.groupKey === 'deze-week');
    expect(thisWeek?.items).toHaveLength(1);
  });

  it('assigns "volgende-week" to a deadline in next week', () => {
    // 2026-05-25 is Monday next week
    const activity = makeActivity({ id: '3', deadline: '2026-05-25' });
    const groups = groupActivities([activity]);
    const nextWeek = groups.find((g) => g.groupKey === 'volgende-week');
    expect(nextWeek?.items).toHaveLength(1);
  });

  it('assigns "later" to a deadline beyond next week', () => {
    const activity = makeActivity({ id: '4', deadline: '2026-06-10' });
    const groups = groupActivities([activity]);
    const later = groups.find((g) => g.groupKey === 'later');
    expect(later?.items).toHaveLength(1);
  });

  it('assigns "later" to an activity with no deadline', () => {
    const activity = makeActivity({ id: '5', deadline: null });
    const groups = groupActivities([activity]);
    const later = groups.find((g) => g.groupKey === 'later');
    expect(later?.items).toHaveLength(1);
  });

  it('omits groups with no items', () => {
    const activity = makeActivity({ id: '6', deadline: '2026-05-20' });
    const groups = groupActivities([activity]);
    expect(groups.every((g) => g.items.length > 0)).toBe(true);
  });

  it('returns groups in order: eerder → deze-week → volgende-week → later', () => {
    const activities = [
      makeActivity({ id: 'a', deadline: '2026-05-17' }),
      makeActivity({ id: 'b', deadline: '2026-05-20' }),
      makeActivity({ id: 'c', deadline: '2026-05-25' }),
      makeActivity({ id: 'd', deadline: '2026-06-10' }),
    ];
    const groups = groupActivities(activities);
    expect(groups.map((g) => g.groupKey)).toEqual([
      'eerder',
      'deze-week',
      'volgende-week',
      'later',
    ]);
  });
});
