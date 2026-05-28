import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyFinalMessage, generateMessageId } from './chatStreamHelpers';
import type { ChatUiAction, Message } from './chatStreamHelpers';

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

describe('applyFinalMessage', () => {
  it('attaches actions to the streaming message when provided', () => {
    const messages: Message[] = [
      { id: 'user-1', role: 'student', content: 'Open het paneel' },
      { id: 'assistant-1', role: 'assistant', content: '', isStreaming: true },
    ];
    const actions: ChatUiAction[] = [
      { action: 'open_activities_panel', label: 'Open activiteiten' },
    ];

    const result = applyFinalMessage(
      messages,
      'assistant-1',
      { text: 'Gedaan!', conversationId: 'c1' },
      actions,
    );

    expect(result.find((m) => m.id === 'assistant-1')).toMatchObject({
      content: 'Gedaan!',
      isStreaming: false,
      actions: [{ action: 'open_activities_panel', label: 'Open activiteiten' }],
    });
  });

  it('omits actions field when no actions are provided', () => {
    const result = applyFinalMessage(
      [{ id: 'assistant-1', role: 'assistant', content: '', isStreaming: true }],
      'assistant-1',
      {
        text: 'Antwoord.',
        conversationId: 'c1',
      },
    );

    expect(result.find((m) => m.id === 'assistant-1')?.actions).toBeUndefined();
  });

  it('adds final metadata without replacing streamed content', () => {
    const result = applyFinalMessage(
      [{ id: 'assistant-1', role: 'assistant', content: 'Gestreamd antwoord.', isStreaming: true }],
      'assistant-1',
      {
        text: 'Final antwoord dat niet opnieuw in de bubble moet worden gezet.',
        conversationId: 'c1',
        sources: [{ kind: 'canvas', label: 'Canvas: Activiteit', url: null }],
      },
      [{ action: 'open_activities_panel', label: 'Open activiteiten' }],
    );

    expect(result.find((m) => m.id === 'assistant-1')).toMatchObject({
      content: 'Gestreamd antwoord.',
      isStreaming: false,
      sources: [{ kind: 'canvas', label: 'Canvas: Activiteit', url: null }],
      actions: [{ action: 'open_activities_panel', label: 'Open activiteiten' }],
    });
  });
});
