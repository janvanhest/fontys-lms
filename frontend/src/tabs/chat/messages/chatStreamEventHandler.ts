import type { Dispatch, SetStateAction } from 'react';
import { parseFinalChatPayload, type ChatSseEvent } from '@/api/chat';
import {
  applyErrorMessage,
  applyFinalMessage,
  createNudgeMessage,
  type ChatUiAction,
  type Message,
} from './chatStreamHelpers';
import {
  CHAT_WRITING_STATUS,
  getStatusFromEventText,
  getStatusFromToolCall,
  toolCallToBubble,
  type ChatStatus,
} from './chatStreamStatus';

type StreamEventHandlers = {
  scheduleStatus: (status: ChatStatus | null) => void;
  forceStatus: (status: ChatStatus | null) => void;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  onConversationEstablished?: (id: string) => void;
  onUiAction?: (action: string, payload?: Record<string, string>) => void;
};

export function handleStreamEvent(
  sseEvent: ChatSseEvent,
  streamingId: string,
  pendingSuggestions: ChatUiAction[],
  handlers: StreamEventHandlers,
): void {
  const { scheduleStatus, forceStatus, setMessages, onConversationEstablished, onUiAction } =
    handlers;
  switch (sseEvent.event) {
    case 'status':
      scheduleStatus(getStatusFromEventText(sseEvent.data));
      break;
    case 'tool_call': {
      // Bypass scheduleStatus: always show tool status immediately and reset
      // the minimum-duration clock so rapid subsequent events (e.g. the next
      // iteration's 'status') cannot wipe this before it's ever rendered.
      forceStatus(getStatusFromToolCall(sseEvent.data));
      const payload = JSON.parse(sseEvent.data) as { name: string };
      const bubble = toolCallToBubble(payload.name);
      if (bubble) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamingId && !m.toolCalls?.some((tc) => tc.name === bubble.name)
              ? { ...m, toolCalls: [...(m.toolCalls ?? []), bubble] }
              : m,
          ),
        );
      }
      break;
    }
    case 'tool_result':
      scheduleStatus(CHAT_WRITING_STATUS);
      break;
    case 'text_delta':
      setMessages((prev) =>
        prev.map((m) => (m.id === streamingId ? { ...m, content: m.content + sseEvent.data } : m)),
      );
      scheduleStatus(null);
      break;
    case 'stream_reset':
      break;
    case 'ui_action': {
      const uiPayload = JSON.parse(sseEvent.data) as {
        action: string;
        mode: string;
        label: string;
        activityId?: string;
      };
      if (uiPayload.mode === 'auto') {
        onUiAction?.(
          uiPayload.action,
          uiPayload.activityId ? { activityId: uiPayload.activityId } : undefined,
        );
      } else {
        const action = {
          action: uiPayload.action as ChatUiAction['action'],
          label: uiPayload.label,
          ...(uiPayload.activityId ? { payload: { activityId: uiPayload.activityId } } : {}),
        };
        setMessages((prev) => [...prev, createNudgeMessage(action)]);
      }
      break;
    }
    case 'final': {
      const finalPayload = parseFinalChatPayload(sseEvent.data);
      if (finalPayload.conversationId) {
        onConversationEstablished?.(finalPayload.conversationId);
      }
      setMessages((prev) => applyFinalMessage(prev, streamingId, finalPayload, pendingSuggestions));
      scheduleStatus(null);
      break;
    }
    case 'error':
      setMessages((prev) => applyErrorMessage(prev, streamingId, sseEvent.data));
      scheduleStatus(null);
      break;
  }
}
