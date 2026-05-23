import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Psychology from '@mui/icons-material/Psychology';
import type { RefObject } from 'react';
import { useRef } from 'react';
import { studentInitials, type StudentProfile } from '@/api/student';
import type { Message } from '@/hooks/useChatStream';
import { useTypewriter, CURSOR_FADE_DURATION_MS } from '@/hooks/useTypewriter';
import { ChatMarkdown } from './ChatMarkdown';

function CursorSpan({ phase }: { phase: 'blinking' | 'fading' }) {
  return (
    <Box
      component="span"
      sx={{
        color: 'primary.main',
        fontWeight: 'bold',
        ml: '1px',
        animation:
          phase === 'blinking'
            ? 'cursorBlink 0.8s step-end infinite'
            : `cursorFade ${CURSOR_FADE_DURATION_MS}ms ease forwards`,
        '@keyframes cursorBlink': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        '@keyframes cursorFade': {
          '0%': { opacity: 1 },
          '55%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      }}
    >
      │
    </Box>
  );
}

type ChatMessageListProps = {
  bottomRef: RefObject<HTMLDivElement | null>;
  messages: Message[];
  student?: StudentProfile;
  onAction?: (messageId: string, action: string, payload?: Record<string, string>) => void;
};

export function ChatMessageList({ bottomRef, messages, student, onAction }: ChatMessageListProps) {
  const streamingMessage = messages.find((m) => m.isStreaming);

  const lastStreamingRef = useRef<{ id: string; content: string } | null>(null);
  if (streamingMessage) {
    lastStreamingRef.current = { id: streamingMessage.id, content: streamingMessage.content };
  }

  const typewriterContent = streamingMessage?.content ?? lastStreamingRef.current?.content ?? '';
  const { displayed: displayedContent, isAtEnd, cursorPhase } = useTypewriter(
    typewriterContent,
    Boolean(streamingMessage),
  );

  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
      <Stack spacing={2.5}>
        {messages.map((message) => {
          const isStudent = message.role === 'student';
          const isAnimatedMsg = message.id === lastStreamingRef.current?.id && cursorPhase !== 'hidden';
          const isStillTyping = isAnimatedMsg && !isAtEnd && Boolean(streamingMessage);
          const content = isAnimatedMsg ? displayedContent : message.content;
          const lastPara = isStillTyping ? displayedContent.lastIndexOf('\n\n') : -1;
          const renderedPart = lastPara >= 0 ? displayedContent.slice(0, lastPara + 2) : '';
          const animatingPart = lastPara >= 0 ? displayedContent.slice(lastPara + 2) : displayedContent;
          return (
            <Box key={message.id}>
              {!isStudent && message.toolCalls && message.toolCalls.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.75,
                    pl: '44px', // avatar breedte (34px) + gap (10px)
                    mb: 0.5,
                  }}
                >
                  {message.toolCalls.map((tc) => (
                    <Box
                      key={tc.name}
                      sx={{
                        borderLeft: '3px solid',
                        borderColor: 'secondary.light',
                        pl: 1,
                        pr: 1.25,
                        py: 0.5,
                        bgcolor: 'rgba(123, 31, 162, 0.04)',
                        borderRadius: '0 6px 6px 0',
                        fontSize: '0.75rem',
                        color: 'primary.dark',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tc.label}
                    </Box>
                  ))}
                </Box>
              )}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1.5,
                  justifyContent: isStudent ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-start',
                }}
              >
                {!isStudent && (
                  <Box sx={{ position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      width: 34,
                      height: 34,
                      ...(message.isStreaming && {
                        animation: 'rainbow 2s linear infinite, pulse 1.2s ease-in-out infinite',
                        '@keyframes rainbow': {
                          '0%':    { backgroundColor: 'hsl(0,   90%, 52%)' },
                          '14%':   { backgroundColor: 'hsl(30,  95%, 50%)' },
                          '28%':   { backgroundColor: 'hsl(55,  90%, 45%)' },
                          '42%':   { backgroundColor: 'hsl(130, 70%, 40%)' },
                          '57%':   { backgroundColor: 'hsl(190, 85%, 42%)' },
                          '71%':   { backgroundColor: 'hsl(240, 80%, 58%)' },
                          '85%':   { backgroundColor: 'hsl(290, 75%, 52%)' },
                          '100%':  { backgroundColor: 'hsl(0,   90%, 52%)' },
                        },
                        '@keyframes pulse': {
                          '0%, 100%': { transform: 'scale(1)' },
                          '50%':      { transform: 'scale(1.1)' },
                        },
                      }),
                    }}
                  >
                    <Psychology sx={{ fontSize: 20 }} />
                  </Avatar>
                  </Box>
                )}
                <Paper
                  elevation={0}
                  sx={{
                    maxWidth: 680,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: isStudent ? 'grey.100' : 'background.paper',
                    color: 'text.primary',
                  }}
                >
                  {isAnimatedMsg && !content ? (
                    <CircularProgress size={16} />
                  ) : isStudent ? (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  ) : (
                    <Box>
                      {isAnimatedMsg ? (
                        <>
                          {renderedPart && <ChatMarkdown content={renderedPart} />}
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {animatingPart}
                          </Typography>
                        </>
                      ) : (
                        <ChatMarkdown content={content} isStreaming={message.isStreaming} />
                      )}
                      {message.sources && message.sources.length > 0 ? (
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          sx={{ mt: 1.5, flexWrap: 'wrap' }}
                        >
                          {message.sources.map((source) => {
                            const chip = (
                              <Chip
                                key={`${message.id}-${source.label}-${source.url ?? 'no-url'}`}
                                label={source.label}
                                size="small"
                                variant="outlined"
                                clickable={Boolean(source.url)}
                                sx={{
                                  borderColor: 'divider',
                                  bgcolor: 'grey.50',
                                  fontSize: '0.75rem',
                                  '& .MuiChip-label': { px: 1.25 },
                                }}
                              />
                            );
                            if (!source.url) return chip;
                            return (
                              <Box
                                key={`${message.id}-${source.label}-${source.url}`}
                                component="a"
                                href={source.url}
                                target="_blank"
                                rel="noreferrer"
                                sx={{ textDecoration: 'none' }}
                              >
                                {chip}
                              </Box>
                            );
                          })}
                        </Stack>
                      ) : null}
                      {message.actions && message.actions.length > 0 ? (
                        <Stack
                          direction="row"
                          spacing={1}
                          useFlexGap
                          sx={{ mt: 1.5, flexWrap: 'wrap' }}
                        >
                          {message.actions.map((a) => (
                            <Chip
                              key={a.action}
                              label={a.label}
                              size="small"
                              onClick={() => onAction?.(message.id, a.action, a.payload)}
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                        </Stack>
                      ) : null}
                    </Box>
                  )}
                </Paper>
                {isStudent && (
                  <Avatar
                    src={student?.avatarUrl ?? undefined}
                    alt={student?.displayName}
                    sx={{ bgcolor: 'secondary.main', width: 34, height: 34 }}
                  >
                    {student ? studentInitials(student.displayName) : 'S'}
                  </Avatar>
                )}
              </Box>
            </Box>
          );
        })}
        <div ref={bottomRef} />
      </Stack>
    </Box>
  );
}
