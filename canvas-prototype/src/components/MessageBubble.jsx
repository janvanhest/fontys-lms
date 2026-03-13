import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useIsWireframeTheme } from '../hooks/useIsWireframeTheme';

export default function MessageBubble({ role, text }) {
  const theme = useTheme();
  const isUser = role === 'user';
  const isWireframe = useIsWireframeTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        mb: 1.5,
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.25, px: 0.5 }}>
        {isUser ? 'student' : 'assistent'}
      </Typography>
      <Paper
        elevation={0}
        sx={{
          px: 1.5,
          py: 1,
          maxWidth: '75%',
          backgroundColor: isUser
            ? (isWireframe ? theme.palette.action.selected : theme.palette.grey[100])
            : 'transparent',
          border: isWireframe
            ? `1px dashed ${theme.palette.divider}`
            : isUser ? `1px solid ${theme.palette.divider}` : 'none',
          fontStyle: isWireframe ? 'italic' : 'normal',
        }}
      >
        <Typography variant="body2">{text}</Typography>
      </Paper>
    </Box>
  );
}
