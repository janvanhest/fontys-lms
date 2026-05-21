import { queryOptions } from '@tanstack/react-query';
import {
  mapConversationMessageToUiMessage,
  parseFinalChatPayload,
  streamChatMessage as streamChatMessageRequest,
} from './chat-stream';
import type { ChatSseEvent, ConversationDetails, ConversationSummary } from './chat-types';
export type {
  ChatSource,
  ChatSseEvent,
  ConversationDetails,
  ConversationMessage,
  ConversationSummary,
  FinalChatPayload,
  UiChatMessage,
} from './chat-types';

const backendUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000';

export { mapConversationMessageToUiMessage, parseFinalChatPayload };

export const conversationSummariesQueryOptions = queryOptions({
  queryKey: ['chat', 'conversations'],
  queryFn: () => fetchConversations(),
});

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
  yield* streamChatMessageRequest(backendUrl, message, conversationId, signal);
}
