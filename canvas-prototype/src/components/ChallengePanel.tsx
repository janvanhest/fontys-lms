import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LaunchIcon from '@mui/icons-material/Launch';
import { alpha, useTheme } from '@mui/material/styles';

import { useIsWireframeTheme } from '../hooks/useIsWireframeTheme';

const CHALLENGE_TOOL_URL = 'https://www.fontyschallenges.nl/';

export default function ChallengePanel() {
  const theme = useTheme();
  const isWireframe = useIsWireframeTheme();
  const primary = theme.palette.primary.main;

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 } }}>
      <Stack spacing={2.5}>
        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            background: isWireframe
              ? theme.palette.background.paper
              : `linear-gradient(135deg, ${alpha(primary, 0.08)} 0%, ${theme.palette.background.paper} 100%)`,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip label="Challenge" color={isWireframe ? 'default' : 'primary'} />
              <Chip label="Externe tool" variant="outlined" />
            </Stack>
            <Typography variant="h4">Fontys Challenges</Typography>
            <Typography variant="body1" sx={{ maxWidth: 780, color: 'text.secondary' }}>
              Hier komt alles rond challenge-oriëntatie, challengekeuze en voortgang samen.
              De tool hieronder is direct ingebed; als die door browserregels niet laadt,
              open je hem in een nieuw tabblad.
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button
                component="a"
                href={CHALLENGE_TOOL_URL}
                target="_blank"
                rel="noreferrer"
                variant={isWireframe ? 'outlined' : 'contained'}
                endIcon={<LaunchIcon />}
              >
                Open challenge tool
              </Button>
              <Link
                href={CHALLENGE_TOOL_URL}
                target="_blank"
                rel="noreferrer"
                underline="hover"
                color="text.secondary"
                sx={{ alignSelf: 'center' }}
              >
                {CHALLENGE_TOOL_URL}
              </Link>
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ overflow: 'hidden' }}>
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: isWireframe
                ? theme.palette.background.default
                : alpha(primary, 0.04),
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Embedded challenge tool
            </Typography>
          </Box>
          <Box sx={{ height: 'calc(100vh - 320px)', minHeight: 520, backgroundColor: '#fff' }}>
            <iframe
              title="Fontys Challenges"
              src={CHALLENGE_TOOL_URL}
              style={{ width: '100%', height: '100%', border: 0 }}
            />
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}
