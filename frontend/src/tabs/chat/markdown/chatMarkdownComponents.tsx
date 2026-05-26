import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import {
  codeBlockSx,
  inlineCodeSx,
  paragraphSx,
  tableSx,
  tableWrapperSx,
} from './chatMarkdownStyles';
import { flattenNodeText } from './chatMarkdownUtils';

export const chatMarkdownComponents = {
  p: ({ children }: { children?: ReactNode }) => (
    <Typography component="p" variant="body1" sx={paragraphSx}>
      {children}
    </Typography>
  ),
  h1: ({ children }: { children?: ReactNode }) => (
    <Typography component="h2" variant="h6" sx={{ mt: 0, mb: 1.25, lineHeight: 1.3 }}>
      {children}
    </Typography>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <Typography
      component="h3"
      variant="subtitle1"
      sx={{ mt: 0, mb: 1.25, fontWeight: 700, lineHeight: 1.35 }}
    >
      {children}
    </Typography>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <Typography
      component="h4"
      variant="body1"
      sx={{ mt: 0, mb: 1, fontWeight: 700, lineHeight: 1.4 }}
    >
      {children}
    </Typography>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <Box
      component="ul"
      sx={{
        my: 1.25,
        pl: 2.75,
        '& li::marker': {
          color: 'text.secondary',
        },
      }}
    >
      {children}
    </Box>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <Box
      component="ol"
      sx={{
        my: 1.25,
        pl: 2.75,
        '& li::marker': {
          color: 'text.secondary',
          fontWeight: 700,
        },
      }}
    >
      {children}
    </Box>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <Box
      component="li"
      sx={{
        mb: 0.625,
        pl: 0.25,
        '& > p, & > ul, & > ol': {
          my: 0,
        },
        '& > p + p, & > p + ul, & > p + ol, & > ul + p, & > ol + p': {
          mt: 0.75,
        },
      }}
    >
      {children}
    </Box>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <Box
      component="blockquote"
      sx={{
        my: 1.5,
        mx: 0,
        px: 1.5,
        py: 1,
        borderLeft: '3px solid',
        borderColor: 'primary.light',
        bgcolor: 'action.hover',
        color: 'text.secondary',
        borderRadius: 1,
        '& p': {
          fontStyle: 'italic',
        },
      }}
    >
      {children}
    </Box>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      sx={{ textUnderlineOffset: '0.16em' }}
    >
      {children}
    </Link>
  ),
  code: ({ children, className }: { children?: ReactNode; className?: string }) => {
    const isBlock = typeof className === 'string' && className.length > 0;
    if (isBlock) {
      return (
        <Box component="code" className={className} sx={codeBlockSx}>
          {flattenNodeText(children).replace(/\n$/, '')}
        </Box>
      );
    }
    return (
      <Box component="code" sx={inlineCodeSx}>
        {children}
      </Box>
    );
  },
  pre: ({ children }: { children?: ReactNode }) => <Box sx={{ my: 1.5 }}>{children}</Box>,
  table: ({ children }: { children?: ReactNode }) => (
    <Box sx={tableWrapperSx}>
      <Box component="table" sx={tableSx}>
        {children}
      </Box>
    </Box>
  ),
};
