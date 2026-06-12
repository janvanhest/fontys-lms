import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { alpha, keyframes } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { fontysColors } from '@/themes/muiTheme';
import type { ChatUiAction } from './chatStreamHelpers';

type NudgeMessageBubbleProps = {
  action: ChatUiAction;
  messageId: string;
  onAction?: (messageId: string, action: string, payload?: Record<string, string>) => void;
};

const ANIMATION_DURATION_MS = 12_000;

const nudgePulse = keyframes`
  0%   { box-shadow: 0 0 0 0   ${alpha(fontysColors.magenta.main, 0.4)}; }
  70%  { box-shadow: 0 0 0 8px ${alpha(fontysColors.magenta.main, 0)}; }
  100% { box-shadow: 0 0 0 0   ${alpha(fontysColors.magenta.main, 0)}; }
`;

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
        sx={{
          bgcolor: 'background.paper',
          animation: animated ? `${nudgePulse} 2s ease-in-out infinite` : 'none',
        }}
      >
        {action.label}
      </Button>
    </Box>
  );
}
