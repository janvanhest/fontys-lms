import { useCallback, useEffect, useRef, useState } from 'react';
import { streamChatMessage } from '@/api/chat';
import {
  applyErrorMessage,
  createPendingMessages,
  type ChatUiAction,
  type Message,
} from './chatStreamHelpers';
import { CHAT_HISTORY_STATUS } from './chatStreamStatus';
import { handleStreamEvent } from './chatStreamEventHandler';
import { useConversationHistory } from './useConversationHistory';
import { useScheduledStatus } from './useScheduledStatus';

export type { Message } from './chatStreamHelpers';

type UseChatStreamOptions = {
  onConversationEstablished?: (conversationId: string) => void;
  onUiAction?: (action: string, payload?: Record<string, string>) => void;
};

export function useChatStream(conversationId?: string, options: UseChatStreamOptions = {}) {
  const { onConversationEstablished, onUiAction } = options;
  const hasConversation = Boolean(conversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(hasConversation);
  const isMountedRef = useRef(true);
  const streamAbortRef = useRef<AbortController | null>(null);
  const previousConversationIdRef = useRef<string | undefined>(undefined);
  const messagesRef = useRef<Message[]>([]);
  const { status, scheduleStatus, forceStatus } = useScheduledStatus(
    isMountedRef,
    hasConversation ? CHAT_HISTORY_STATUS : null,
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      streamAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useConversationHistory({
    conversationId,
    isMountedRef,
    messagesRef,
    previousConversationIdRef,
    scheduleStatus,
    setIsLoadingHistory,
    setMessages,
    streamAbortRef,
  });

  const consumeAction = useCallback((messageId: string, action: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId && m.role === 'nudge' && m.action) {
          return { ...m, action: { ...m.action, used: true } };
        }
        if (m.id === messageId && m.role !== 'nudge') {
          return { ...m, actions: m.actions?.filter((a) => a.action !== action) };
        }
        return m;
      }),
    );
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreaming || isLoadingHistory) return;

      streamAbortRef.current?.abort();
      const controller = new AbortController();
      streamAbortRef.current = controller;

      const { streamingId, streamingMessage, userMessage } = createPendingMessages(text);
      const currentStreamingIdRef = { current: streamingId };
      const pendingSuggestions: ChatUiAction[] = [];

      setMessages((prev) => [...prev, userMessage, streamingMessage]);
      setIsStreaming(true);
      scheduleStatus(null);

      try {
        for await (const sseEvent of streamChatMessage(text, conversationId, controller.signal)) {
          if (!isMountedRef.current) return;
          handleStreamEvent(sseEvent, streamingId, pendingSuggestions, {
            scheduleStatus,
            forceStatus,
            setMessages,
            getStreamingId: () => currentStreamingIdRef.current,
            setStreamingId: (nextStreamingId) => {
              currentStreamingIdRef.current = nextStreamingId;
            },
            onConversationEstablished,
            onUiAction,
          });
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          // Intentional abort — no action needed.
        } else if (isMountedRef.current) {
          setMessages((prev) =>
            applyErrorMessage(
              prev,
              streamingId,
              'Error: de chatverbinding is onderbroken. Probeer het opnieuw.',
            ),
          );
          scheduleStatus(null);
        }
      } finally {
        if (streamAbortRef.current === controller) {
          streamAbortRef.current = null;
        }
        if (isMountedRef.current) {
          setIsStreaming(false);
          scheduleStatus(null);
        }
      }
    },
    [
      isStreaming,
      isLoadingHistory,
      conversationId,
      onConversationEstablished,
      onUiAction,
      scheduleStatus,
      forceStatus,
    ],
  );

  return { messages, isStreaming, isLoadingHistory, status, sendMessage, consumeAction };
}
