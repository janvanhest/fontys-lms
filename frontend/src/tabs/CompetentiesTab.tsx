import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CompetenceOverview } from './competenties/CompetenceOverview';

export function CompetentiesTab() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1">
            Competenties
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Je voortgang per HBO-i laag en activiteit.
          </Typography>
        </Box>

        <CompetenceOverview />
      </Stack>
    </Box>
  );
}
