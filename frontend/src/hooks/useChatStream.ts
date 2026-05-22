// frontend/src/hooks/useChatStream.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { parseFinalChatPayload, streamChatMessage } from '@/api/chat';
import {
  applyErrorMessage,
  applyFinalMessage,
  CHAT_HISTORY_STATUS,
  CHAT_WRITING_STATUS,
  createPendingMessages,
  getStatusFromEventText,
  getStatusFromToolCall,
  loadConversationHistory,
  toolCallToBubble,
  type ChatStatus,
  type ChatUiAction,
  type Message,
} from './chatStreamHelpers';

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
  const [status, setStatus] = useState<ChatStatus | null>(hasConversation ? CHAT_HISTORY_STATUS : null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      streamAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    streamAbortRef.current?.abort();
    if (!conversationId) return;

    const controller = new AbortController();
    let ignore = false;

    void loadConversationHistory(conversationId, controller.signal)
      .then((historyMessages) => {
        if (ignore || !isMountedRef.current) return;
        setMessages(historyMessages);
        setStatus(null);
      })
      .catch((error: unknown) => {
        if (ignore || !isMountedRef.current) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setMessages([]);
        setStatus({ label: 'Gesprek laden mislukt.', icon: 'history' });
      })
      .finally(() => {
        if (!isMountedRef.current) return;
        setIsLoadingHistory(false);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [conversationId]);

  const consumeAction = useCallback((messageId: string, action: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, actions: m.actions?.filter((a) => a.action !== action) } : m,
      ),
    );
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreaming || isLoadingHistory) return;

      streamAbortRef.current?.abort();
      const controller = new AbortController();
      streamAbortRef.current = controller;

      const { streamingId, streamingMessage, userMessage } = createPendingMessages(text);
      const pendingSuggestions: ChatUiAction[] = [];

      setMessages((prev) => [...prev, userMessage, streamingMessage]);
      setIsStreaming(true);
      setStatus(null);

      try {
        for await (const sseEvent of streamChatMessage(text, conversationId, controller.signal)) {
          if (!isMountedRef.current) return;

          switch (sseEvent.event) {
            case 'status':
              setStatus(getStatusFromEventText(sseEvent.data));
              break;
            case 'tool_call': {
              setStatus(getStatusFromToolCall(sseEvent.data));
              const payload = JSON.parse(sseEvent.data) as { name: string };
              const bubble = toolCallToBubble(payload.name);
              if (bubble) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === streamingId
                      ? { ...m, toolCalls: [...(m.toolCalls ?? []), bubble] }
                      : m,
                  ),
                );
              }
              break;
            }
            case 'tool_result':
              setStatus(CHAT_WRITING_STATUS);
              break;
            case 'text_delta':
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId ? { ...m, content: m.content + sseEvent.data } : m,
                ),
              );
              setStatus(null);
              break;
            case 'stream_reset':
              setMessages((prev) =>
                prev.map((m) => (m.id === streamingId ? { ...m, content: '' } : m)),
              );
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
                pendingSuggestions.push({
                  action: uiPayload.action as ChatUiAction['action'],
                  label: uiPayload.label,
                  ...(uiPayload.activityId ? { payload: { activityId: uiPayload.activityId } } : {}),
                });
              }
              break;
            }
            case 'final': {
              const finalPayload = parseFinalChatPayload(sseEvent.data);
              if (finalPayload.conversationId) {
                onConversationEstablished?.(finalPayload.conversationId);
              }
              setMessages((prev) =>
                applyFinalMessage(prev, streamingId, finalPayload, pendingSuggestions),
              );
              setStatus(null);
              break;
            }
            case 'error':
              setMessages((prev) =>
                applyErrorMessage(prev, streamingId, `Error: ${sseEvent.data}`),
              );
              setStatus(null);
              break;
          }
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
          setStatus(null);
        }
      } finally {
        if (streamAbortRef.current === controller) {
          streamAbortRef.current = null;
        }
        if (isMountedRef.current) {
          setIsStreaming(false);
          setStatus(null);
        }
      }
    },
    [isStreaming, isLoadingHistory, conversationId, onConversationEstablished, onUiAction],
  );

  return { messages, isStreaming, isLoadingHistory, status, sendMessage, consumeAction };
}
