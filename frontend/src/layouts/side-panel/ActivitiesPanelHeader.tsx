import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function ActivitiesPanelHeader() {
  return (
    <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6">Activiteiten</Typography>
      <Typography variant="body2" color="text.secondary">
        Tijdlijn van activiteiten en deadlines.
      </Typography>
    </Box>
  );
}
