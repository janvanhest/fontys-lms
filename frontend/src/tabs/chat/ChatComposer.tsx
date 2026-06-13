import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import type { KeyboardEvent } from 'react';

type ChatComposerProps = {
  disabled: boolean;
  input: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent) => void;
  onSend: () => void;
};

export function ChatComposer({ disabled, input, onChange, onKeyDown, onSend }: ChatComposerProps) {
  return (
    <Box
      sx={{
        py: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: { xs: '100%', md: 760, lg: 980, xl: 1200 } }}>
      <TextField
        fullWidth
        multiline
        minRows={2}
        maxRows={6}
        placeholder="Typ je vraag..."
        value={input}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        onKeyDown={onKeyDown}
        disabled={disabled}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end" sx={{ alignSelf: 'flex-end', pb: 0.5 }}>
                <IconButton
                  aria-label="Bericht verzenden"
                  onClick={onSend}
                  disabled={disabled || !input.trim()}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled',
                    },
                  }}
                >
                  <ArrowUpwardIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      </Container>
    </Box>
  );
}
