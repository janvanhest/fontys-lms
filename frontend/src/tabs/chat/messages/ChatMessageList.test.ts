import { describe, expect, it } from 'vitest';
import { getVisibleMessageContent } from './messageRenderState';
import type { Message } from './chatStreamHelpers';

describe('getVisibleMessageContent', () => {
  it('falls back to message content when the typewriter output is empty', () => {
    const message: Message = {
      id: 'assistant-1',
      role: 'assistant',
      content: '## Persoonlijk ontwikkelplan\n\nVul hier je doelen in.',
      isStreaming: true,
    };

    expect(getVisibleMessageContent(message, '')).toBe(message.content);
  });

  it('uses typewriter output while a streaming message is animating', () => {
    const message: Message = {
      id: 'assistant-1',
      role: 'assistant',
      content: 'Volledig antwoord',
      isStreaming: true,
    };

    expect(getVisibleMessageContent(message, 'Volledig')).toBe('Volledig');
  });
});
