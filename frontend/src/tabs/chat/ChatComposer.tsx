import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import type { KeyboardEvent } from 'react';

type ChatComposerProps = {
  disabled: boolean;
  input: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onSend: () => void;
};

export function ChatComposer({
  disabled,
  input,
  onChange,
  onKeyDown,
  onSend,
}: ChatComposerProps) {
  return (
    <Box
      sx={{
        px: { xs: 2, md: 3 },
        py: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
          placeholder="Typ je vraag..."
          size="small"
          value={input}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          onKeyDown={onKeyDown}
          disabled={disabled}
        />
        <IconButton
          color="primary"
          aria-label="Send message"
          onClick={onSend}
          disabled={disabled || !input.trim()}
        >
          <ArrowUpwardIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
