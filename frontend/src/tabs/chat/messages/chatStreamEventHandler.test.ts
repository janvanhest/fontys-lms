import { describe, expect, it, vi } from 'vitest';
import type { SetStateAction } from 'react';
import { handleStreamEvent } from './chatStreamEventHandler';
import type { Message } from './chatStreamHelpers';

function createHandlers(messages: Message[]) {
  let streamingId = 'assistant-1';
  return {
    scheduleStatus: vi.fn(),
    forceStatus: vi.fn(),
    setMessages: (updater: SetStateAction<Message[]>) => {
      messages = typeof updater === 'function' ? updater(messages) : updater;
    },
    getStreamingId: () => streamingId,
    setStreamingId: (nextStreamingId: string) => {
      streamingId = nextStreamingId;
    },
    getMessages: () => messages,
  };
}

describe('handleStreamEvent', () => {
  it('starts a new assistant bubble when a stream reset arrives', () => {
    const handlers = createHandlers([
      { id: 'assistant-1', role: 'assistant', content: 'Invultemplate', isStreaming: true },
    ]);

    handleStreamEvent({ event: 'stream_reset', data: '' }, 'assistant-1', [], handlers);

    expect(handlers.getMessages()).toMatchObject([
      { id: 'assistant-1', content: 'Invultemplate', isStreaming: false },
      { role: 'assistant', content: '', isStreaming: true },
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

  it('preserves assistant content across perform_ui_action tool events', () => {
    const handlers = createHandlers([
      {
        id: 'assistant-1',
        role: 'assistant',
        content: '## Persoonlijk ontwikkelplan\n\nVul hier je doelen in.',
        isStreaming: true,
      },
    ]);

    handleStreamEvent(
      { event: 'tool_call', data: JSON.stringify({ name: 'perform_ui_action' }) },
      'assistant-1',
      [],
      handlers,
    );
    handleStreamEvent(
      {
        event: 'ui_action',
        data: JSON.stringify({
          action: 'highlight_activity',
          mode: 'suggest',
          label: 'Open Persoonlijk ontwikkelplan',
          activityId: '37854ed9-e24d-4577-8706-1f1785bc045f',
        }),
      },
      'assistant-1',
      [],
      handlers,
    );
    handleStreamEvent(
      { event: 'tool_result', data: JSON.stringify({ name: 'perform_ui_action' }) },
      'assistant-1',
      [],
      handlers,
    );

    expect(handlers.getMessages()).toMatchObject([
      {
        id: 'assistant-1',
        content: '## Persoonlijk ontwikkelplan\n\nVul hier je doelen in.',
      },
      {
        role: 'nudge',
        action: {
          action: 'highlight_activity',
          label: 'Open Persoonlijk ontwikkelplan',
          payload: { activityId: '37854ed9-e24d-4577-8706-1f1785bc045f' },
        },
      },
    ]);
  });

  it('adds tool-result spacing only once per assistant message', () => {
    const handlers = createHandlers([
      {
        id: 'assistant-1',
        role: 'assistant',
        content: 'Ik kijk even naar je activiteiten.',
        isStreaming: true,
      },
    ]);

    handleStreamEvent(
      { event: 'tool_result', data: JSON.stringify({ name: 'search_activities' }) },
      'assistant-1',
      [],
      handlers,
    );
    handleStreamEvent(
      { event: 'tool_result', data: JSON.stringify({ name: 'get_student_competences' }) },
      'assistant-1',
      [],
      handlers,
    );

    expect(handlers.getMessages()).toMatchObject([
      {
        id: 'assistant-1',
        content: 'Ik kijk even naar je activiteiten.\n\n',
      },
    ]);
  });

  it('keeps text before and after a reset in separate assistant bubbles', () => {
    const handlers = createHandlers([
      { id: 'assistant-1', role: 'assistant', content: '', isStreaming: true },
    ]);

    handleStreamEvent({ event: 'text_delta', data: 'Ik kijk even.' }, 'assistant-1', [], handlers);
    handleStreamEvent({ event: 'stream_reset', data: '' }, 'assistant-1', [], handlers);
    handleStreamEvent(
      { event: 'tool_call', data: JSON.stringify({ name: 'search_activities' }) },
      'assistant-1',
      [],
      handlers,
    );
    handleStreamEvent(
      { event: 'tool_result', data: JSON.stringify({ name: 'search_activities' }) },
      'assistant-1',
      [],
      handlers,
    );
    handleStreamEvent(
      { event: 'text_delta', data: 'Dit zijn je deadlines.' },
      'assistant-1',
      [],
      handlers,
    );
    handleStreamEvent(
      { event: 'final', data: JSON.stringify({ text: '', conversationId: 'c1' }) },
      'assistant-1',
      [],
      handlers,
    );

    expect(handlers.getMessages()).toMatchObject([
      { id: 'assistant-1', content: 'Ik kijk even.', isStreaming: false },
      { role: 'assistant', content: 'Dit zijn je deadlines.', isStreaming: false },
    ]);
  });
});
