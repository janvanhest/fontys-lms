import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import type { ChatUiAction } from './chatStreamHelpers';

type NudgeMessageBubbleProps = {
  action: ChatUiAction;
  messageId: string;
  onAction?: (messageId: string, action: string, payload?: Record<string, string>) => void;
};

export function NudgeMessageBubble({ action, messageId, onAction }: NudgeMessageBubbleProps) {
  return (
    <Box sx={{ display: 'flex', pl: '44px' }}>
      <Paper
        elevation={0}
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Chip
          label={action.label}
          size="small"
          onClick={() => onAction?.(messageId, action.action, action.payload)}
          sx={{ fontSize: '0.75rem' }}
        />
      </Paper>
    </Box>
  );
}
