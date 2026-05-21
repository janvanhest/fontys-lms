import { describe, expect, it } from 'vitest';
import { getActivityFormState } from './activityFormState';

describe('getActivityFormState', () => {
  it('returns defaults for a new activity', () => {
    expect(getActivityFormState(null)).toEqual({
      title: '',
      type: 'opdracht',
      description: '',
      deadline: '',
      competencyLabel: '',
    });
  });

  it('hydrates form state from an existing activity', () => {
    expect(
      getActivityFormState({
        id: 'activity-1',
        portflowId: 101,
        title: 'Workshop',
        description: 'Werk het prototype uit',
        position: 1,
        type: 'workshop',
        status: 'open',
        deadline: '2026-05-28',
        competencyLabel: 'Ontwerpen',
        createdAt: '2026-05-21T10:00:00Z',
        updatedAt: '2026-05-21T10:00:00Z',
      }),
    ).toEqual({
      title: 'Workshop',
      type: 'workshop',
      description: 'Werk het prototype uit',
      deadline: '2026-05-28',
      competencyLabel: 'Ontwerpen',
    });
  });
});
