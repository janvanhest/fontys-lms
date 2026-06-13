import type {
  ChatSource,
  ChatSseEvent,
  ConversationMessage,
  FinalChatPayload,
  UiChatMessage,
} from './chat-types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseSseEventBlock(block: string): ChatSseEvent | null {
  const lines = block.split(/\r?\n/);
  let eventType: ChatSseEvent['event'] | null = null;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      const value = line.slice(6).trim();
      if (
        value === 'status' ||
        value === 'tool_call' ||
        value === 'tool_result' ||
        value === 'ui_action' ||
        value === 'text_delta' ||
        value === 'stream_reset' ||
        value === 'final' ||
        value === 'error'
      ) {
        eventType = value;
      }
    } else if (line.startsWith('data:')) {
      const raw = line.slice(5);
      dataLines.push(raw.startsWith(' ') ? raw.slice(1) : raw);
    }
  }

  const data = dataLines.join('\n');
  if (!data) return null;

  if (eventType) {
    return { event: eventType, data };
  }

  try {
    return JSON.parse(data) as ChatSseEvent;
  } catch {
    return null;
  }
}

export function parseFinalChatPayload(data: string): FinalChatPayload {
  try {
    const parsed = JSON.parse(data) as unknown;
    if (isRecord(parsed) && typeof parsed.text === 'string') {
      const sources = Array.isArray(parsed.sources)
        ? parsed.sources.filter(
            (source): source is ChatSource =>
              isRecord(source) &&
              typeof source.kind === 'string' &&
              typeof source.label === 'string' &&
              (typeof source.url === 'string' || source.url === null),
          )
        : undefined;

      return {
        text: parsed.text,
        conversationId:
          typeof parsed.conversationId === 'string' ? parsed.conversationId : undefined,
        sources: sources?.length ? sources : undefined,
      };
    }
  } catch {
    // Fall through to legacy plain-text payload handling.
  }

  return { text: data };
}

export function mapConversationMessageToUiMessage(message: ConversationMessage): UiChatMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    sources: message.sources,
  };
}

export async function* streamChatMessage(
  backendUrl: string,
  message: string,
  conversationId?: string,
  language?: 'nl' | 'en',
  signal?: AbortSignal,
): AsyncGenerator<ChatSseEvent> {
  const body: { message: string; conversationId?: string; language?: 'nl' | 'en' } = { message };
  if (conversationId) body.conversationId = conversationId;
  if (language) body.language = language;

  const res = await fetch(`${backendUrl}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    yield { event: 'error', data: `HTTP ${String(res.status)}` };
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split(/\r?\n\r?\n/);
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const event = parseSseEventBlock(block);
      if (event !== null) {
        yield event;
      }
    }
  }

  if (buffer.trim()) {
    const event = parseSseEventBlock(buffer);
    if (event !== null) {
      yield event;
    }
  }
}
