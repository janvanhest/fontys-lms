import { describe, expect, it } from 'vitest';
import { parseSseEventBlock } from './chat-stream';

describe('parseSseEventBlock', () => {
  it('parses a text_delta SSE block', () => {
    const block = 'event: text_delta\ndata: Hello';
    expect(parseSseEventBlock(block)).toEqual({ event: 'text_delta', data: 'Hello' });
  });

  it('parses a final SSE block', () => {
    const block = 'event: final\ndata: {"text":"Done","conversationId":"c1"}';
    expect(parseSseEventBlock(block)).toEqual({
      event: 'final',
      data: '{"text":"Done","conversationId":"c1"}',
    });
  });

  it('returns null for an empty block', () => {
    expect(parseSseEventBlock('')).toBeNull();
  });

  it('returns null when data line is missing', () => {
    expect(parseSseEventBlock('event: text_delta')).toBeNull();
  });

  it('preserves leading space in text_delta data (LLM token with leading space)', () => {
    // SSE protocol adds one space after "data:", so "data:  werkt" means the token is " werkt"
    const block = 'event: text_delta\ndata:  werkt eraan';
    expect(parseSseEventBlock(block)).toEqual({ event: 'text_delta', data: ' werkt eraan' });
  });
});
