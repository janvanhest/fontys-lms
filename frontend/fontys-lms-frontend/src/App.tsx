import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Fontys LMS
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Scaffold gereed. Aan de slag.
        </Typography>
      </Box>
    </Container>
  )
}

export default App
