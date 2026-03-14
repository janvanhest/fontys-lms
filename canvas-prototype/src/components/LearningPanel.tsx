import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function LearningPanel() {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      <Typography variant="h4" sx={{ mb: 1 }}>
        Leerpad
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Competenties en voortgang verschijnen hier
      </Typography>
    </Box>
  );
}
