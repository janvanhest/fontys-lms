export const paragraphSx = { my: 0, whiteSpace: 'pre-wrap', lineHeight: 1.65 } as const;

export const inlineCodeSx = {
  px: 0.5,
  py: 0.125,
  borderRadius: 1,
  bgcolor: 'grey.100',
  fontFamily: 'monospace',
  fontSize: '0.875em',
} as const;

export const codeBlockSx = {
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

export const tableWrapperSx = {
  my: 1.5,
  overflowX: 'auto',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 1.5,
  bgcolor: 'background.paper',
} as const;

export const tableSx = {
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
