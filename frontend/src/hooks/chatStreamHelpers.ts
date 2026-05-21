import {
  fetchConversation,
  mapConversationMessageToUiMessage,
  type ChatSource,
  type FinalChatPayload,
} from '@/api/chat';

export type Message = {
  id: string;
  role: 'student' | 'assistant';
  content: string;
  isStreaming?: boolean;
  sources?: ChatSource[];
};

let messageIdCounter = 0;

function generateMessageId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  messageIdCounter += 1;
  return `${prefix}-${String(Date.now())}-${String(messageIdCounter)}`;
}

export function createPendingMessages(text: string) {
  const userMessage: Message = {
    id: generateMessageId('user'),
    role: 'student',
    content: text,
  };
  const streamingId = generateMessageId('assistant');
  const streamingMessage: Message = {
    id: streamingId,
    role: 'assistant',
    content: '',
    isStreaming: true,
  };

  return { streamingId, userMessage, streamingMessage };
}

export function getStatusTextFromToolCall(data: string): string {
  try {
    const payload = JSON.parse(data) as { name?: string };
    return payload.name === 'search_course_content'
      ? 'Bronnen raadplegen...'
      : 'Extra context ophalen...';
  } catch {
    return 'Bronnen raadplegen...';
  }
}

export function applyFinalMessage(
  messages: Message[],
  streamingId: string,
  finalPayload: FinalChatPayload,
): Message[] {
  return messages.map((message) =>
    message.id === streamingId
      ? {
          ...message,
          content: finalPayload.text,
          sources: finalPayload.sources,
          isStreaming: false,
        }
      : message,
  );
}

export function applyErrorMessage(
  messages: Message[],
  streamingId: string,
  content: string,
): Message[] {
  return messages.map((message) =>
    message.id === streamingId ? { ...message, content, isStreaming: false } : message,
  );
}

export async function loadConversationHistory(
  conversationId: string,
  signal: AbortSignal,
): Promise<Message[]> {
  const conversation = await fetchConversation(conversationId, signal);
  return conversation.messages.map(mapConversationMessageToUiMessage);
}
