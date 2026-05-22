import Box from '@mui/material/Box';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatMarkdownComponents } from './chatMarkdownComponents';

type ChatMarkdownProps = {
  content: string;
  isStreaming?: boolean;
};

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <Box
      sx={{
        '& > :first-of-type': { mt: 0 },
        '& > :last-child': { mb: 0 },
        '& p + p': { mt: 1.25 },
        '& ul + p, & ol + p, & blockquote + p, & pre + p': { mt: 1.25 },
      }}
    >
      <Markdown remarkPlugins={[remarkGfm]} components={chatMarkdownComponents}>{content}</Markdown>
    </Box>
  );
}
