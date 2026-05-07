import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function StappenplanTab() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1">
            Stappenplan
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Placeholder voor documentstijl met concrete vervolgstappen.
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, minHeight: 420 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Weekplanning</Typography>
            <Typography color="text.secondary">
              Hier komt een documentachtige weergave met actiepunten, deadlines en feedback.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  )
}
