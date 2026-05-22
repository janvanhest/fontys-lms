import {
  fetchConversation,
  mapConversationMessageToUiMessage,
  type ChatSource,
  type FinalChatPayload,
} from '@/api/chat';

export type ChatUiAction = {
  action: 'open_activities_panel' | 'highlight_activity';
  label: string;
  payload?: Record<string, string>;
};

export type ChatStatusIcon =
  | 'activities'
  | 'sources'
  | 'panel'
  | 'spark'
  | 'writing'
  | 'history'
  | 'thinking'
  | 'tool';

export type ChatStatus = {
  label: string;
  icon: ChatStatusIcon;
};

export type Message = {
  id: string;
  role: 'student' | 'assistant';
  content: string;
  isStreaming?: boolean;
  sources?: ChatSource[];
  actions?: ChatUiAction[];
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

export function getStatusFromToolCall(data: string): ChatStatus {
  try {
    const payload = JSON.parse(data) as { name?: string };
    if (payload.name === 'search_activities') {
      return { label: 'Activiteiten bekijken...', icon: 'activities' };
    }
    if (payload.name === 'search_course_content') {
      return { label: 'Bronnen bekijken...', icon: 'sources' };
    }
    if (payload.name === 'perform_ui_action') {
      return { label: 'Paneel openen...', icon: 'panel' };
    }

    return { label: 'Extra context ophalen...', icon: 'tool' };
  } catch {
    return { label: 'Bronnen bekijken...', icon: 'sources' };
  }
}

export function getStatusFromEventText(text: string): ChatStatus {
  if (text === 'Nadenken...') {
    return { label: text, icon: 'thinking' };
  }

  if (text === 'Tool uitvoeren...') {
    return { label: text, icon: 'tool' };
  }

  return { label: text, icon: 'spark' };
}

export const CHAT_HISTORY_STATUS: ChatStatus = {
  label: 'Gesprek laden...',
  icon: 'history',
};

export const CHAT_WRITING_STATUS: ChatStatus = {
  label: 'Antwoord voorbereiden...',
  icon: 'writing',
};

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
          content: finalPayload.text,
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
