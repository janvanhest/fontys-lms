import type { KeyboardEvent } from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { useTheme } from '@mui/material/styles';

import { useIsWireframeTheme } from '../hooks/useIsWireframeTheme';

interface InputBarProps {
  onSend: (value: string) => void;
}

export default function InputBar({ onSend }: InputBarProps) {
  const [value, setValue] = useState('');
  const theme = useTheme();
  const isWireframe = useIsWireframeTheme();
  const canSend = value.trim().length > 0;

  const handleSend = () => {
    if (!canSend) {
      return;
    }

    onSend(value.trim());
    setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ p: 1.5, backgroundColor: 'background.default' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isWireframe ? 0 : `${theme.shape.borderRadius}px`,
          border: isWireframe
            ? `2px dashed ${theme.palette.text.secondary}`
            : `1px solid ${theme.palette.divider}`,
          backgroundColor: 'background.paper',
          boxShadow: isWireframe ? 'none' : theme.shadows[2],
          overflow: 'hidden',
        }}
      >
        <InputBase
          multiline
          maxRows={6}
          fullWidth
          placeholder="Typ een bericht..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            px: 1.5,
            pt: 1.25,
            pb: 0.5,
            alignItems: 'flex-start',
            '& textarea': { lineHeight: 1.5 },
          }}
        />

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 0.75, pb: 0.75 }}>
          <Tooltip title="Bestand toevoegen" placement="top">
            <IconButton
              size="small"
              sx={{
                border: isWireframe
                  ? `1px dashed ${theme.palette.text.secondary}`
                  : `1px solid ${theme.palette.divider}`,
                borderRadius: isWireframe ? 0 : '50%',
                width: 30,
                height: 30,
                color: 'text.secondary',
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <IconButton
            size="small"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Verstuur bericht"
            sx={{
              width: 30,
              height: 30,
              borderRadius: isWireframe ? 0 : '50%',
              backgroundColor: canSend
                ? theme.palette.primary.main
                : isWireframe
                  ? 'transparent'
                  : theme.palette.action.disabledBackground,
              border: isWireframe
                ? `1px ${canSend ? 'solid' : 'dashed'} ${
                    canSend ? theme.palette.primary.main : theme.palette.text.disabled
                  }`
                : 'none',
              color: canSend ? theme.palette.primary.contrastText : 'text.disabled',
              '&:hover': {
                backgroundColor: canSend ? theme.palette.primary.dark : undefined,
              },
              '&.Mui-disabled': {
                color: theme.palette.text.disabled,
              },
              transition: 'background-color 0.15s ease',
            }}
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}
