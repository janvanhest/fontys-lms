import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import type { ChatUiAction } from './chatStreamHelpers';

type NudgeMessageBubbleProps = {
  action: ChatUiAction;
  messageId: string;
  onAction?: (messageId: string, action: string, payload?: Record<string, string>) => void;
};

const ANIMATION_DURATION_MS = 12_000;

export function NudgeMessageBubble({ action, messageId, onAction }: NudgeMessageBubbleProps) {
  const [animated, setAnimated] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { setAnimated(false); }, ANIMATION_DURATION_MS);
    return () => { clearTimeout(timer); };
  }, []);

  return (
    <Box sx={{ display: 'flex', pl: '44px' }}>
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        disabled={action.used === true}
        onClick={() => onAction?.(messageId, action.action, action.payload)}
        sx={(theme) => ({
          bgcolor: 'background.paper',
          '@keyframes nudgePulse': {
            '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0.4)}` },
            '70%': { boxShadow: `0 0 0 8px ${alpha(theme.palette.secondary.main, 0)}` },
            '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.secondary.main, 0)}` },
          },
          animation: animated ? 'nudgePulse 2s ease-in-out infinite' : 'none',
        })}
      >
        {action.label}
      </Button>
    </Box>
  );
}
