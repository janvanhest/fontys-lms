import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        <Typography variant="h2" component="h1">
          Fontys LMS
        </Typography>
        <Typography variant="body1">Startpunt voor de frontend van het Fontys LMS.</Typography>
        <Box>
          <Button component={Link} to="/storybook-demo" variant="contained">
            Open Storybook Demo
          </Button>
        </Box>
      </Stack>
    </Container>
  );
}
