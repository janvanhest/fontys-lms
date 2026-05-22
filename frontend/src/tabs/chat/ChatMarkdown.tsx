import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatMarkdownComponents } from './chatMarkdownComponents';

type ChatMarkdownProps = {
  content: string;
  isStreaming?: boolean;
};

export function ChatMarkdown({ content, isStreaming }: ChatMarkdownProps) {
  return <ChatMarkdownContent key={isStreaming ? 'streaming' : content} content={content} isStreaming={isStreaming} />;
}

function ChatMarkdownContent({ content, isStreaming }: ChatMarkdownProps) {
  const [expanded, setExpanded] = useState(false);
  const isLongContent = useMemo(
    () => content.length > 1400 || content.split('\n').length > 18,
    [content],
  );

  return (
    <Box
      sx={{
        '& > :first-of-type': { mt: 0 },
        '& > :last-child': { mb: 0 },
        '& p + p': { mt: 1.25 },
        '& ul + p, & ol + p, & blockquote + p, & pre + p': { mt: 1.25 },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          maxHeight: isLongContent && !expanded && !isStreaming ? 320 : 'none',
          overflow: 'hidden',
        }}
      >
        <Markdown remarkPlugins={[remarkGfm]} components={chatMarkdownComponents}>{content}</Markdown>
        {isLongContent && !expanded && !isStreaming && (
          <Box
            sx={{
              position: 'absolute',
              insetInline: 0,
              bottom: 0,
              height: 72,
              background: (theme) =>
                `linear-gradient(to bottom, transparent 0%, ${theme.palette.background.paper}cc 60%, ${theme.palette.background.paper} 100%)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>
      {isLongContent && !isStreaming && (
        <Button
          size="small"
          onClick={() => { setExpanded((prev) => !prev); }}
          sx={{ mt: 1, px: 0, minWidth: 0, alignSelf: 'flex-start' }}
        >
          {expanded ? 'Minder tonen' : 'Meer tonen'}
        </Button>
      )}
    </Box>
  );
}
