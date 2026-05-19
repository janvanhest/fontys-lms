const backendUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';

export type ConversationSummary = {
  id: string;
  studentId: string;
  createdAt: string;
  title?: string;
};

export type ConversationMessage = {
  id: string;
  role: 'student' | 'assistant';
  content: string;
  timestamp: string;
  sources?: ChatSource[];
};

export type ConversationDetails = {
  id: string;
  studentId: string;
  createdAt: string;
  title?: string;
  messages: ConversationMessage[];
};

export type ChatSseEvent = {
  event: 'status' | 'tool_call' | 'tool_result' | 'final' | 'error';
  data: string;
};

export type ChatSource = {
  kind: string;
  label: string;
  url: string | null;
};

export type FinalChatPayload = {
  text: string;
  conversationId?: string;
  sources?: ChatSource[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseSseEventBlock(block: string): ChatSseEvent | null {
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
        value === 'final' ||
        value === 'error'
      ) {
        eventType = value;
      }
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
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
        conversationId: typeof parsed.conversationId === 'string' ? parsed.conversationId : undefined,
        sources: sources?.length ? sources : undefined,
      };
    }
  } catch {
    // Fall through to legacy plain-text payload handling.
  }

  return { text: data };
}

export async function fetchConversations(): Promise<ConversationSummary[]> {
  const res = await fetch(`${backendUrl}/chat/conversations`);
  if (!res.ok) throw new Error(`Failed to fetch conversations: ${String(res.status)}`);
  return res.json() as Promise<ConversationSummary[]>;
}

export async function fetchConversation(
  conversationId: string,
  signal?: AbortSignal,
): Promise<ConversationDetails> {
  const res = await fetch(`${backendUrl}/chat/conversations/${conversationId}`, { signal });
  if (!res.ok) throw new Error(`Failed to fetch conversation: ${String(res.status)}`);
  return res.json() as Promise<ConversationDetails>;
}

export async function updateConversationTitle(
  conversationId: string,
  title: string,
): Promise<{ id: string; title: string }> {
  const res = await fetch(`${backendUrl}/chat/conversations/${conversationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) throw new Error(`Failed to update conversation title: ${String(res.status)}`);
  return res.json() as Promise<{ id: string; title: string }>;
}

export async function* streamChatMessage(
  message: string,
  conversationId?: string,
  signal?: AbortSignal,
): AsyncGenerator<ChatSseEvent> {
  const res = await fetch(`${backendUrl}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationId }),
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
