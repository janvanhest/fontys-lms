import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react';
import {
  loadConversationHistory,
  shouldLoadConversationHistory,
  type Message,
} from './chatStreamHelpers';
import type { ChatStatus } from './chatStreamStatus';

type UseConversationHistoryOptions = {
  conversationId?: string;
  isMountedRef: RefObject<boolean>;
  messagesRef: RefObject<Message[]>;
  previousConversationIdRef: RefObject<string | undefined>;
  scheduleStatus: (status: ChatStatus | null) => void;
  setIsLoadingHistory: Dispatch<SetStateAction<boolean>>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  streamAbortRef: RefObject<AbortController | null>;
};

export function useConversationHistory({
  conversationId,
  isMountedRef,
  messagesRef,
  previousConversationIdRef,
  scheduleStatus,
  setIsLoadingHistory,
  setMessages,
  streamAbortRef,
}: UseConversationHistoryOptions) {
  useEffect(() => {
    streamAbortRef.current?.abort();
    if (!conversationId) {
      previousConversationIdRef.current = undefined;
      return;
    }

    const previousConversationId = previousConversationIdRef.current;
    previousConversationIdRef.current = conversationId;
    if (
      !shouldLoadConversationHistory({
        nextConversationId: conversationId,
        previousConversationId,
        hasLocalMessages: messagesRef.current.length > 0,
      })
    ) {
      setIsLoadingHistory(false);
      return;
    }

    const controller = new AbortController();
    let ignore = false;

    void loadConversationHistory(conversationId, controller.signal)
      .then((historyMessages) => {
        if (ignore || !isMountedRef.current) return;
        setMessages(historyMessages);
        scheduleStatus(null);
      })
      .catch((error: unknown) => {
        if (ignore || !isMountedRef.current) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setMessages([]);
        scheduleStatus({ label: 'Gesprek laden mislukt.', icon: 'history' });
      })
      .finally(() => {
        if (ignore || !isMountedRef.current) return;
        setIsLoadingHistory(false);
      });

    return () => {
      ignore = true;
      controller.abort();
      // Restore the ref so a StrictMode re-run (or rapid re-mount) starts fresh.
      previousConversationIdRef.current = previousConversationId;
    };
  }, [
    conversationId,
    isMountedRef,
    messagesRef,
    previousConversationIdRef,
    scheduleStatus,
    setIsLoadingHistory,
    setMessages,
    streamAbortRef,
  ]);
}
