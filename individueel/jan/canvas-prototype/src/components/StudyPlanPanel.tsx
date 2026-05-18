import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LaunchIcon from '@mui/icons-material/Launch';
import { alpha, useTheme } from '@mui/material/styles';

import {
  STUDY_PLAN_CTA,
  STUDY_PLAN_INTRO,
  STUDY_PLAN_STEPS,
} from '../data/studyPlan';
import { useIsWireframeTheme } from '../hooks/useIsWireframeTheme';

export default function StudyPlanPanel() {
  const theme = useTheme();
  const isWireframe = useIsWireframeTheme();
  const heroColor = '#8b5a9f';
  const noteColor = '#f59e0b';

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 } }}>
      <Stack spacing={3} sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            backgroundColor: isWireframe ? theme.palette.background.paper : heroColor,
            color: isWireframe ? 'text.primary' : '#fff',
          }}
        >
          <Typography variant="h3" sx={{ mb: 1.5 }}>
            Stappenplan
          </Typography>
          <Typography variant="h6" sx={{ color: isWireframe ? 'text.secondary' : 'inherit' }}>
            Vier stappen om je semester te starten in Pro Open Learning
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderLeft: `4px solid ${heroColor}`,
            backgroundColor: isWireframe ? theme.palette.background.paper : '#f8f6fa',
          }}
        >
          <Typography variant="body1" sx={{ lineHeight: 1.75, color: isWireframe ? 'text.primary' : '#673462' }}>
            {STUDY_PLAN_INTRO}
          </Typography>
        </Paper>

        <Stack spacing={4}>
          {STUDY_PLAN_STEPS.map((step) => (
            <Box key={step.id}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: isWireframe ? 0 : 2,
                    backgroundColor: isWireframe ? 'transparent' : heroColor,
                    border: isWireframe ? `2px dashed ${theme.palette.text.secondary}` : 'none',
                    color: isWireframe ? 'text.primary' : '#fff',
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {step.number}
                </Box>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                  {step.title}
                </Typography>
              </Stack>

              <Box sx={{ ml: { xs: 0, md: 8 } }}>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2.5 }}>
                  {step.description}
                </Typography>

                <Stack spacing={2}>
                  {step.links.map((item) => (
                    <Paper key={item.title} sx={{ p: 2.5 }}>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 1.5 }}>
                        {item.description}
                      </Typography>
                      <Link
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        underline="hover"
                        sx={{
                          color: isWireframe ? 'text.primary' : heroColor,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                          fontWeight: 600,
                        }}
                      >
                        Bekijk pagina
                        <LaunchIcon sx={{ fontSize: 16 }} />
                      </Link>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </Box>
          ))}
        </Stack>

        <Paper
          sx={{
            p: 3,
            borderLeft: `4px solid ${noteColor}`,
            backgroundColor: isWireframe ? theme.palette.background.paper : '#fefce8',
          }}
        >
          <Typography variant="h6" sx={{ mb: 1.25, color: isWireframe ? 'text.primary' : '#a16207' }}>
            Start nu
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.75, color: isWireframe ? 'text.primary' : '#a16207' }}>
            {STUDY_PLAN_CTA.description}
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
          <Button
            component="a"
            href={STUDY_PLAN_CTA.href}
            target="_blank"
            rel="noreferrer"
            variant={isWireframe ? 'outlined' : 'contained'}
            sx={{
              px: 3,
              py: 1.25,
              backgroundColor: isWireframe ? undefined : heroColor,
              '&:hover': {
                backgroundColor: isWireframe ? undefined : alpha(heroColor, 0.9),
              },
            }}
          >
            {STUDY_PLAN_CTA.label}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
