import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function CompetentiesTab() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1">
            Competenties
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Placeholder voor overzicht links en sticky detail rechts.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' },
          }}
        >
          <Paper variant="outlined" sx={{ p: 3, minHeight: 360 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Overzicht
            </Typography>
            <Typography color="text.secondary">
              Lijst van competenties, niveaus en voortgang komt hier.
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 3,
              minHeight: 360,
              position: { lg: 'sticky' },
              top: { lg: 24 },
              alignSelf: 'start',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              Detail
            </Typography>
            <Typography color="text.secondary">
              Detailpaneel voor geselecteerde competentie komt hier.
            </Typography>
          </Paper>
        </Box>
      </Stack>
    </Box>
  )
}
