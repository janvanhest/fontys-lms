import Box from '@mui/material/Box';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentProfileOptions } from '@/api/student';
import { useLayout } from '@/context/useLayout';
import { useChatStream } from './messages/useChatStream';
import { ChatComposer } from './ChatComposer';
import { ChatMessageList } from './messages/ChatMessageList';
import { ChatTabHeader } from './header/ChatTabHeader';

type ChatTabProps = {
  conversationId?: string;
};

export function ChatTab({ conversationId }: ChatTabProps = {}) {
  const {
    sidePanelOpen,
    setSidePanelOpen,
    sidePanelContent,
    openSidePanel,
    highlightActivity,
    activeTab,
    setSelectedConversationId,
  } = useLayout();

  const activePanel = sidePanelOpen ? (sidePanelContent?.type ?? null) : null;

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
      } else if (action === 'open_competences_panel') {
        openSidePanel({ type: 'competences' });
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
    (messageId: string, action: string, payload?: Record<string, string>) => {
      handleUiAction(action, payload);
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
        isStreaming={isStreaming}
        onToggleActivities={() => {
          if (activePanel === 'activities') {
            setSidePanelOpen(false);
          } else {
            openSidePanel({ type: 'activities' });
          }
        }}
        onToggleCompetences={() => {
          if (activePanel === 'competences') {
            setSidePanelOpen(false);
          } else {
            openSidePanel({ type: 'competences' });
          }
        }}
        activePanel={activePanel}
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
