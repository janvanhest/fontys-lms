import {
  fetchConversation,
  mapConversationMessageToUiMessage,
  type ChatSource,
  type FinalChatPayload,
} from '@/api/chat';
import type { ToolCallBubble } from './chatStreamStatus';

export type ChatUiAction = {
  action: 'open_activities_panel' | 'highlight_activity';
  label: string;
  payload?: Record<string, string>;
};

export type Message = {
  id: string;
  role: 'student' | 'assistant' | 'nudge';
  content: string;
  isStreaming?: boolean;
  sources?: ChatSource[];
  actions?: ChatUiAction[];
  action?: ChatUiAction;
  toolCalls?: ToolCallBubble[];
};

export function generateMessageId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2)}`;
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

export function createStreamingAssistantMessage(): Message {
  return {
    id: generateMessageId('assistant'),
    role: 'assistant',
    content: '',
    isStreaming: true,
  };
}

export function createNudgeMessage(action: ChatUiAction): Message {
  return {
    id: generateMessageId('nudge'),
    role: 'nudge',
    content: '',
    action,
  };
}

export function splitStreamingAssistantMessage(
  messages: Message[],
  streamingId: string,
  nextMessage: Message,
) {
  return messages
    .map((message) => (message.id === streamingId ? { ...message, isStreaming: false } : message))
    .concat(nextMessage);
}

export function shouldLoadConversationHistory({
  nextConversationId,
  previousConversationId,
  hasLocalMessages,
}: {
  nextConversationId: string;
  previousConversationId: string | undefined;
  hasLocalMessages: boolean;
}) {
  if (previousConversationId === undefined && hasLocalMessages) return false;
  return previousConversationId !== nextConversationId;
}

export function applyFinalMessage(
  messages: Message[],
  streamingId: string,
  finalPayload: FinalChatPayload,
  actions: ChatUiAction[] = [],
): Message[] {
  return messages.map((message) =>
    message.id === streamingId
      ? {
          ...message,
          content: message.content.length > 0 ? message.content : finalPayload.text,
          sources: finalPayload.sources,
          isStreaming: false,
          ...(actions.length > 0 ? { actions } : {}),
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
