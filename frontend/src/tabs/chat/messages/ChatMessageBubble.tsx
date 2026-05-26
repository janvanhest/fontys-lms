import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Psychology from '@mui/icons-material/Psychology';
import { studentInitials, type StudentProfile } from '@/api/student';
import type { Message } from './useChatStream';
import { AssistantMessageContent } from './AssistantMessageContent';
import { streamingAvatarSx } from './chatBubbleStyles';

type ChatMessageBubbleProps = {
  message: Message;
  content: string;
  isAnimating: boolean;
  renderedPart: string;
  animatingPart: string;
  student?: StudentProfile;
  onAction?: (messageId: string, action: string, payload?: Record<string, string>) => void;
};

export function ChatMessageBubble({
  message,
  content,
  isAnimating,
  renderedPart,
  animatingPart,
  student,
  onAction,
}: ChatMessageBubbleProps) {
  const isStudent = message.role === 'student';

  return (
    <Box>
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
                ...(message.isStreaming && streamingAvatarSx),
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
          {message.isStreaming && !content ? (
            <Box sx={{ display: 'flex', gap: 0.75, py: 0.5 }}>
              {[0, 1, 2].map((i) => (
                <Skeleton
                  key={i}
                  variant="circular"
                  width={8}
                  height={8}
                  sx={{
                    animationDelay: `${(i * 0.15).toString()}s`,
                    bgcolor: 'primary.main',
                    opacity: 0.4,
                  }}
                />
              ))}
            </Box>
          ) : isStudent ? (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
          ) : (
            <AssistantMessageContent
              message={message}
              content={content}
              isAnimating={isAnimating}
              renderedPart={renderedPart}
              animatingPart={animatingPart}
              onAction={onAction}
            />
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
}
