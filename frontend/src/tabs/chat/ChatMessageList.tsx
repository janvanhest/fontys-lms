import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { RefObject } from 'react';
import { studentInitials, type StudentProfile } from '@/api/student';
import type { Message } from '@/hooks/useChatStream';
import { ChatMarkdown } from './ChatMarkdown';

type ChatMessageListProps = {
  bottomRef: RefObject<HTMLDivElement | null>;
  messages: Message[];
  student?: StudentProfile;
  onAction?: (messageId: string, action: string, payload?: Record<string, string>) => void;
};

export function ChatMessageList({ bottomRef, messages, student, onAction }: ChatMessageListProps) {
  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
      <Stack spacing={2.5}>
        {messages.map((message) => {
          const isStudent = message.role === 'student';
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
                  alignItems: 'flex-end',
                }}
              >
                {!isStudent && (
                  <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>L</Avatar>
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
                  {message.isStreaming && !message.content ? (
                    <CircularProgress size={16} />
                  ) : isStudent ? (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  ) : (
                    <Box>
                      <ChatMarkdown content={message.content} isStreaming={message.isStreaming} />
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
