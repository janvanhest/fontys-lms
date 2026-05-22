import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { isValidElement, type ReactNode } from 'react';

const paragraphSx = { my: 0, whiteSpace: 'pre-wrap', lineHeight: 1.65 } as const;
const inlineCodeSx = {
  px: 0.5,
  py: 0.125,
  borderRadius: 1,
  bgcolor: 'grey.100',
  fontFamily: 'monospace',
  fontSize: '0.875em',
} as const;
const codeBlockSx = {
  display: 'block',
  overflowX: 'auto',
  px: 1.5,
  py: 1.25,
  borderRadius: 1.5,
  bgcolor: 'grey.100',
  fontFamily: 'monospace',
  fontSize: 13,
  whiteSpace: 'pre',
  lineHeight: 1.55,
} as const;
const tableWrapperSx = {
  my: 1.5,
  overflowX: 'auto',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1.5,
  bgcolor: 'background.paper',
} as const;
const tableSx = {
  width: '100%',
  minWidth: 420,
  borderCollapse: 'separate',
  borderSpacing: 0,
  fontSize: '0.95rem',
  lineHeight: 1.5,
  '& thead th': {
    px: 1.5,
    py: 1,
    textAlign: 'left',
    fontWeight: 700,
    color: 'text.primary',
    bgcolor: 'action.hover',
    borderBottom: '1px solid',
    borderColor: 'divider',
    whiteSpace: 'nowrap',
  },
  '& tbody td': {
    px: 1.5,
    py: 1,
    verticalAlign: 'top',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },
  '& tbody tr:nth-of-type(even)': {
    bgcolor: 'action.hover',
  },
  '& tbody tr:last-of-type td': {
    borderBottom: 'none',
  },
} as const;

function flattenNodeText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(flattenNodeText).join('');
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return flattenNodeText(node.props.children);
  }

  return '';
}

function MarkdownCode({ children, className }: { children?: ReactNode; className?: string }) {
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
}

function MarkdownListItem({ children }: { children?: ReactNode }) {
  return (
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
  );
}

function MarkdownTable({ children }: { children?: ReactNode }) {
  return (
    <Box sx={tableWrapperSx}>
      <Box component="table" sx={tableSx}>
        {children}
      </Box>
    </Box>
  );
}

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
  li: MarkdownListItem,
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
  code: MarkdownCode,
  pre: ({ children }: { children?: ReactNode }) => <Box sx={{ my: 1.5 }}>{children}</Box>,
  table: MarkdownTable,
};
