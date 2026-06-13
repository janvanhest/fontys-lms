import PsychologyIcon from '@mui/icons-material/Psychology';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { RefObject } from 'react';
import type { StudentProfile } from '@/api/student';
import type { Message } from './useChatStream';
import { useTypewriter } from './useTypewriter';
import { ChatMessageBubble } from './ChatMessageBubble';
import { getVisibleMessageContent } from './messageRenderState';

type ChatMessageListProps = {
  bottomRef: RefObject<HTMLDivElement | null>;
  messages: Message[];
  student?: StudentProfile;
  onAction?: (messageId: string, action: string, payload?: Record<string, string>) => void;
};

export function ChatMessageList({ bottomRef, messages, student, onAction }: ChatMessageListProps) {
  const streamingMessage = messages.find((m) => m.isStreaming);
  const displayedContent = useTypewriter(
    streamingMessage?.content ?? '',
    Boolean(streamingMessage?.isStreaming),
  );

  if (messages.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          px: 3,
          opacity: 0.5,
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PsychologyIcon sx={{ color: 'primary.contrastText', fontSize: 32 }} />
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Stel een vraag over je activiteiten, deadlines of studievoortgang.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
      <Stack spacing={2.5}>
        {messages.map((message) => {
          const content = getVisibleMessageContent(message, displayedContent);
          const isAnimating =
            Boolean(message.isStreaming) && displayedContent.length < message.content.length;
          const lastPara = isAnimating ? content.lastIndexOf('\n\n') : -1;
          const renderedPart = lastPara >= 0 ? content.slice(0, lastPara + 2) : '';
          const animatingPart = lastPara >= 0 ? content.slice(lastPara + 2) : content;
          return (
            <ChatMessageBubble
              key={message.id}
              message={message}
              content={content}
              isAnimating={isAnimating}
              renderedPart={renderedPart}
              animatingPart={animatingPart}
              student={student}
              onAction={onAction}
            />
          );
        })}
        <div ref={bottomRef} />
      </Stack>
    </Box>
  );
}
