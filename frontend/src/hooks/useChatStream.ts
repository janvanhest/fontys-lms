import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchConversation,
  mapConversationMessageToUiMessage,
  parseFinalChatPayload,
  streamChatMessage,
  type ChatSource,
} from '@/api/chat';

export type Message = {
  id: string;
  role: 'student' | 'assistant';
  content: string;
  isStreaming?: boolean;
  sources?: ChatSource[];
};

type UseChatStreamOptions = {
  onConversationEstablished?: (conversationId: string) => void;
};

let messageIdCounter = 0;

function generateMessageId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  messageIdCounter += 1;
  return `${prefix}-${String(Date.now())}-${String(messageIdCounter)}`;
}

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

    void fetchConversation(conversationId, controller.signal)
      .then((conversation) => {
        if (ignore || !isMountedRef.current) return;

        setMessages(
          conversation.messages.map(mapConversationMessageToUiMessage),
        );
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

      const userMsg: Message = {
        id: generateMessageId('user'),
        role: 'student',
        content: text,
      };
      const streamingId = generateMessageId('assistant');
      const streamingMsg: Message = {
        id: streamingId,
        role: 'assistant',
        content: '',
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, streamingMsg]);
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
              try {
                const payload = JSON.parse(sseEvent.data) as { name?: string };
                setStatusText(
                  payload.name === 'search_course_content'
                    ? 'Bronnen raadplegen...'
                    : 'Extra context ophalen...',
                );
              } catch {
                setStatusText('Bronnen raadplegen...');
              }
              break;
            case 'tool_result':
              setStatusText('Antwoord opstellen...');
              break;
            case 'final': {
              const finalPayload = parseFinalChatPayload(sseEvent.data);
              if (finalPayload.conversationId) {
                onConversationEstablished?.(finalPayload.conversationId);
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId
                    ? {
                        ...m,
                        content: finalPayload.text,
                        sources: finalPayload.sources,
                        isStreaming: false,
                      }
                    : m,
                ),
              );
              setStatusText(null);
              break;
            }
            case 'error':
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamingId
                    ? { ...m, content: `Error: ${sseEvent.data}`, isStreaming: false }
                    : m,
                ),
              );
              setStatusText(null);
              break;
          }
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          // Ignore aborted streams; cleanup happens in finally.
        } else if (isMountedRef.current) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === streamingId
                ? {
                    ...m,
                    content: 'Error: de chatverbinding is onderbroken. Probeer het opnieuw.',
                    isStreaming: false,
                  }
                : m,
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
