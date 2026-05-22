import Box from '@mui/material/Box';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentProfileOptions } from '@/api/student';
import { useLayout } from '@/context/useLayout';
import { useChatStream } from '@/hooks/useChatStream';
import { ChatComposer } from './ChatComposer';
import { ChatMessageList } from './ChatMessageList';
import { ChatTabHeader } from './ChatTabHeader';

type ChatTabProps = {
  conversationId?: string;
};

export function ChatTab({ conversationId }: ChatTabProps = {}) {
  const {
    sidePanelOpen,
    setSidePanelOpen,
    openSidePanel,
    highlightActivity,
    activeTab,
    setSelectedConversationId,
  } = useLayout();

  const handleConversationEstablished = useCallback(
    (nextConversationId: string) => {
      if (conversationId === nextConversationId) return;
      setSelectedConversationId(nextConversationId);
    },
    [conversationId, setSelectedConversationId],
  );

  const handleUiAction = useCallback(
    (action: string, payload?: Record<string, string>) => {
      if (action === 'open_activities_panel') {
        openSidePanel({ type: 'activities' });
      } else if (action === 'highlight_activity' && payload?.activityId) {
        openSidePanel({ type: 'activities' });
        highlightActivity(payload.activityId);
      }
    },
    [openSidePanel, highlightActivity],
  );

  const { messages, isStreaming, isLoadingHistory, status, sendMessage, consumeAction } =
    useChatStream(conversationId, {
      onConversationEstablished: handleConversationEstablished,
      onUiAction: handleUiAction,
    });

  const handleAction = useCallback(
    (messageId: string, action: string) => {
      handleUiAction(action);
      consumeAction(messageId, action);
    },
    [handleUiAction, consumeAction],
  );

  const { data: student } = useQuery(studentProfileOptions);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput('');
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'background.default',
      }}
    >
      <ChatTabHeader
        activeTab={activeTab}
        isLoadingHistory={isLoadingHistory}
        onToggleActivities={() => {
          if (sidePanelOpen) {
            setSidePanelOpen(false);
          } else {
            openSidePanel({ type: 'activities' });
          }
        }}
        sidePanelOpen={sidePanelOpen}
        status={status}
      />
      <ChatMessageList
        bottomRef={bottomRef}
        messages={messages}
        student={student}
        onAction={handleAction}
      />
      <ChatComposer
        disabled={isStreaming || isLoadingHistory}
        input={input}
        onChange={setInput}
        onKeyDown={handleKeyDown}
        onSend={() => {
          void handleSend();
        }}
      />
    </Box>
  );
}
