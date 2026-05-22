import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyFinalMessage,
  generateMessageId,
  getStatusFromEventText,
  getStatusFromToolCall,
} from './chatStreamHelpers';
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

describe('getStatusFromToolCall', () => {
  it('returns the activity lookup status metadata for search_activities', () => {
    expect(getStatusFromToolCall(JSON.stringify({ name: 'search_activities' }))).toMatchObject({
      label: 'Activiteiten bekijken...',
      icon: 'activities',
    });
  });

  it('preserves the source lookup status for search_course_content', () => {
    expect(getStatusFromToolCall(JSON.stringify({ name: 'search_course_content' }))).toMatchObject(
      {
        label: 'Bronnen bekijken...',
        icon: 'sources',
      },
    );
  });

  it('returns generic context status metadata for unknown tools', () => {
    expect(getStatusFromToolCall(JSON.stringify({ name: 'unknown_tool' }))).toMatchObject({
      label: 'Extra context ophalen...',
      icon: 'tool',
    });
  });

  it('shows panel status for perform_ui_action', () => {
    expect(getStatusFromToolCall(JSON.stringify({ name: 'perform_ui_action' }))).toMatchObject({
      label: 'Paneel openen...',
      icon: 'panel',
    });
  });
});

describe('getStatusFromEventText', () => {
  it('maps nadenken status to a dedicated thinking icon', () => {
    expect(getStatusFromEventText('Nadenken...')).toMatchObject({
      label: 'Nadenken...',
      icon: 'thinking',
    });
  });

  it('maps tool uitvoeren status to a dedicated tool icon', () => {
    expect(getStatusFromEventText('Tool uitvoeren...')).toMatchObject({
      label: 'Tool uitvoeren...',
      icon: 'tool',
    });
  });

  it('keeps unknown status text readable with the default spark icon', () => {
    expect(getStatusFromEventText('Bezig...')).toMatchObject({
      label: 'Bezig...',
      icon: 'spark',
    });
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
    const messages: Message[] = [
      { id: 'assistant-1', role: 'assistant', content: '', isStreaming: true },
    ];

    const result = applyFinalMessage(messages, 'assistant-1', { text: 'Antwoord.', conversationId: 'c1' });

    expect(result.find((m) => m.id === 'assistant-1')?.actions).toBeUndefined();
  });
});
