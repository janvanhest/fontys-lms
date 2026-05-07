import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h2" component="h1">
          404
        </Typography>
        <Typography variant="body1">
          Deze pagina bestaat niet of is verplaatst.
        </Typography>
        <Box>
          <Button component={Link} to="/" variant="contained">
            Terug naar home
          </Button>
        </Box>
      </Stack>
    </Container>
  )
}
