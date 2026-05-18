import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type ChatMarkdownProps = {
  content: string
}

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
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <Typography
              component="p"
              variant="body1"
              sx={{ my: 0, whiteSpace: 'pre-wrap', lineHeight: 1.65 }}
            >
              {children}
            </Typography>
          ),
          h1: ({ children }) => (
            <Typography component="h2" variant="h6" sx={{ mt: 0, mb: 1.25, lineHeight: 1.3 }}>
              {children}
            </Typography>
          ),
          h2: ({ children }) => (
            <Typography
              component="h3"
              variant="subtitle1"
              sx={{ mt: 0, mb: 1.25, fontWeight: 700, lineHeight: 1.35 }}
            >
              {children}
            </Typography>
          ),
          h3: ({ children }) => (
            <Typography
              component="h4"
              variant="body1"
              sx={{ mt: 0, mb: 1, fontWeight: 700, lineHeight: 1.4 }}
            >
              {children}
            </Typography>
          ),
          ul: ({ children }) => (
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
          ol: ({ children }) => (
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
          li: ({ children }) => (
            <Box component="li" sx={{ mb: 0.625, pl: 0.25 }}>
              <Typography component="span" variant="body1" sx={{ lineHeight: 1.65 }}>
                {children}
              </Typography>
            </Box>
          ),
          blockquote: ({ children }) => (
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
          a: ({ href, children }) => (
            <Link
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              sx={{ textUnderlineOffset: '0.16em' }}
            >
              {children}
            </Link>
          ),
          code: ({ children, className }) => {
            const isBlock = typeof className === 'string' && className.length > 0

            if (isBlock) {
              return (
                <Box
                  component="code"
                  className={className}
                  sx={{
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
                  }}
                >
                  {String(children).replace(/\n$/, '')}
                </Box>
              )
            }

            return (
              <Box
                component="code"
                sx={{
                  px: 0.5,
                  py: 0.125,
                  borderRadius: 1,
                  bgcolor: 'grey.100',
                  fontFamily: 'monospace',
                  fontSize: '0.875em',
                }}
              >
                {children}
              </Box>
            )
          },
          pre: ({ children }) => <Box sx={{ my: 1.5 }}>{children}</Box>,
        }}
      >
        {content}
      </Markdown>
    </Box>
  )
}
