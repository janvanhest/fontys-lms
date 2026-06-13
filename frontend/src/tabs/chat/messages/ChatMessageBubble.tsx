import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import Psychology from '@mui/icons-material/Psychology';
import { studentInitials, type StudentProfile } from '@/api/student';
import type { Message } from './useChatStream';
import { AssistantMessageContent } from './AssistantMessageContent';
import { streamingAvatarSx } from './chatBubbleStyles';
import { NudgeMessageBubble } from './NudgeMessageBubble';
import { ToolCallBubbles } from './ToolCallBubbles';

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
  const isNudge = message.role === 'nudge';
  const nudgeAction = message.action;
  if (isNudge && nudgeAction) {
    return <NudgeMessageBubble action={nudgeAction} messageId={message.id} onAction={onAction} />;
  }

  return (
    <Box>
      {!isStudent && message.toolCalls && message.toolCalls.length > 0 && (
        <ToolCallBubbles toolCalls={message.toolCalls} />
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
          sx={(theme) => ({
            maxWidth: 680,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: isStudent
              ? alpha(theme.palette.primary.main, 0.2)
              : theme.palette.divider,
            bgcolor: isStudent
              ? alpha(theme.palette.primary.main, 0.08)
              : theme.palette.background.paper,
            color: 'text.primary',
          })}
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
