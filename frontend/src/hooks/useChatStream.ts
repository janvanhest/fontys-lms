import { useCallback, useEffect, useRef, useState } from 'react';
import {
  parseFinalChatPayload,
  streamChatMessage,
} from '@/api/chat';
import {
  applyErrorMessage,
  applyFinalMessage,
  createPendingMessages,
  getStatusTextFromToolCall,
  loadConversationHistory,
  type Message,
} from './chatStreamHelpers';

export type { Message } from './chatStreamHelpers';

type UseChatStreamOptions = {
  onConversationEstablished?: (conversationId: string) => void;
};

export function useChatStream(conversationId?: string, options: UseChatStreamOptions = {}) {
  const { onConversationEstablished } = options;
  const hasConversation = Boolean(conversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(hasConversation);
  const [statusText, setStatusText] = useState<string | null>(
    hasConversation ? 'Gesprek laden...' : null,
  );
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

    if (!conversationId) {
      return;
    }

    const controller = new AbortController();
    let ignore = false;

    void loadConversationHistory(conversationId, controller.signal)
      .then((historyMessages) => {
        if (ignore || !isMountedRef.current) return;

        setMessages(historyMessages);
        setStatusText(null);
      })
      .catch((error: unknown) => {
        if (ignore || !isMountedRef.current) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;

        setMessages([]);
        setStatusText('Gesprek laden mislukt.');
      })
      .finally(() => {
        if (ignore || !isMountedRef.current) return;
        setIsLoadingHistory(false);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreaming || isLoadingHistory) return;

      streamAbortRef.current?.abort();
      const controller = new AbortController();
      streamAbortRef.current = controller;

      const { streamingId, streamingMessage, userMessage } = createPendingMessages(text);

      setMessages((prev) => [...prev, userMessage, streamingMessage]);
      setIsStreaming(true);
      setStatusText(null);

      try {
        for await (const sseEvent of streamChatMessage(text, conversationId, controller.signal)) {
          if (!isMountedRef.current) return;

          switch (sseEvent.event) {
            case 'status':
              setStatusText(sseEvent.data);
              break;
            case 'tool_call':
              setStatusText(getStatusTextFromToolCall(sseEvent.data));
              break;
            case 'tool_result':
              setStatusText('Antwoord opstellen...');
              break;
            case 'final': {
              const finalPayload = parseFinalChatPayload(sseEvent.data);
              if (finalPayload.conversationId) {
                onConversationEstablished?.(finalPayload.conversationId);
              }
              setMessages((prev) => applyFinalMessage(prev, streamingId, finalPayload));
              setStatusText(null);
              break;
            }
            case 'error':
              setMessages((prev) => applyErrorMessage(prev, streamingId, `Error: ${sseEvent.data}`));
              setStatusText(null);
              break;
          }
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          // Ignore aborted streams; cleanup happens in finally.
        } else if (isMountedRef.current) {
          setMessages((prev) =>
            applyErrorMessage(
              prev,
              streamingId,
              'Error: de chatverbinding is onderbroken. Probeer het opnieuw.',
            ),
          );
          setStatusText(null);
        }
      } finally {
        if (streamAbortRef.current === controller) {
          streamAbortRef.current = null;
        }
        if (isMountedRef.current) {
          setIsStreaming(false);
          setStatusText(null);
        }
      }
    },
    [isStreaming, isLoadingHistory, conversationId, onConversationEstablished],
  );

  return { messages, isStreaming, isLoadingHistory, statusText, sendMessage };
}
