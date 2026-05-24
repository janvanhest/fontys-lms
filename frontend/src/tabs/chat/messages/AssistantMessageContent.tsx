import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Message } from './useChatStream';
import { ChatMarkdown } from '../markdown/ChatMarkdown';

type AssistantMessageContentProps = {
  message: Message;
  content: string;
  isAnimating: boolean;
  renderedPart: string;
  animatingPart: string;
  onAction?: (messageId: string, action: string, payload?: Record<string, string>) => void;
};

export function AssistantMessageContent({
  message,
  content,
  isAnimating,
  renderedPart,
  animatingPart,
  onAction,
}: AssistantMessageContentProps) {
  return (
    <Box>
      {isAnimating ? (
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
        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1.5, flexWrap: 'wrap' }}>
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
        <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 1.5, flexWrap: 'wrap' }}>
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
  );
}
