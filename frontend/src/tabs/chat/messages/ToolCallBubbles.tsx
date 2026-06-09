import Box from '@mui/material/Box';
import type { ToolCallBubble } from './chatStreamStatus';

type ToolCallBubblesProps = {
  toolCalls: ToolCallBubble[];
};

export function ToolCallBubbles({ toolCalls }: ToolCallBubblesProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, pl: '44px', mb: 0.5 }}>
      {toolCalls.map((tc) => (
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
  );
}
