import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export function ChallengeTab() {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1">
            Challenge
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Placeholder voor de challenge-view met context, status en embedded content.
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            minHeight: 420,
            p: 3,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Iframe-frame of challenge-canvas komt hier.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  )
}
