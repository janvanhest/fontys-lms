import { describe, expect, it, vi } from 'vitest';
import type { SetStateAction } from 'react';
import { handleStreamEvent } from './chatStreamEventHandler';
import type { Message } from './chatStreamHelpers';

function createHandlers(messages: Message[]) {
  return {
    scheduleStatus: vi.fn(),
    forceStatus: vi.fn(),
    setMessages: (updater: SetStateAction<Message[]>) => {
      messages = typeof updater === 'function' ? updater(messages) : updater;
    },
    getMessages: () => messages,
  };
}

describe('handleStreamEvent', () => {
  it('keeps streamed assistant content when a stream reset arrives', () => {
    const handlers = createHandlers([
      { id: 'assistant-1', role: 'assistant', content: 'Invultemplate', isStreaming: true },
    ]);

    handleStreamEvent({ event: 'stream_reset', data: '' }, 'assistant-1', [], handlers);

    expect(handlers.getMessages()).toMatchObject([
      { id: 'assistant-1', content: 'Invultemplate' },
    ]);
  });

  it('creates a separate nudge message for suggested UI actions', () => {
    const handlers = createHandlers([
      { id: 'assistant-1', role: 'assistant', content: 'Je kunt je activiteiten openen.' },
    ]);

    handleStreamEvent(
      {
        event: 'ui_action',
        data: JSON.stringify({
          action: 'open_activities_panel',
          mode: 'suggest',
          label: 'Open activiteiten',
        }),
      },
      'assistant-1',
      [],
      handlers,
    );

    expect(handlers.getMessages()).toMatchObject([
      { id: 'assistant-1', role: 'assistant' },
      {
        role: 'nudge',
        content: '',
        action: { action: 'open_activities_panel', label: 'Open activiteiten' },
      },
    ]);
  });
});
