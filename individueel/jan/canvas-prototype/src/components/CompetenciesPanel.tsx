import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import {
  COMPETENCY_COLUMNS,
  COMPETENCY_MATRIX_ROWS,
  COMPETENCY_OVERVIEW,
  COMPETENCY_OWNER_NAME,
} from '../data/competencies';
import { useCompetencyExplorer } from '../hooks/useCompetencyExplorer';
import { useIsWireframeTheme } from '../hooks/useIsWireframeTheme';
import type { CompetencyBadge } from '../types';

const STATUS_LABELS = {
  mastered: 'Mastered',
  active: 'In focus',
  available: 'Available',
} as const;

function getBadgeVariantColor(
  badge: CompetencyBadge,
  accentColor: string,
  isWireframe: boolean,
) {
  if (isWireframe) {
    return {
      variant: 'outlined' as const,
      sx: {
        borderColor: badge.state === 'mastered' ? 'text.primary' : 'divider',
        color: 'text.primary',
        fontWeight: badge.state === 'active' ? 700 : 500,
      },
    };
  }

  if (badge.state === 'mastered') {
    return {
      variant: 'filled' as const,
      sx: {
        backgroundColor: alpha(accentColor, 0.18),
        color: accentColor,
        fontWeight: 700,
      },
    };
  }

  if (badge.state === 'active') {
    return {
      variant: 'filled' as const,
      sx: {
        backgroundColor: alpha(accentColor, 0.1),
        color: accentColor,
        border: `1px solid ${alpha(accentColor, 0.3)}`,
        fontWeight: 700,
      },
    };
  }

  return {
    variant: 'outlined' as const,
    sx: {
      borderColor: alpha(accentColor, 0.25),
      color: 'text.secondary',
    },
  };
}

export default function CompetenciesPanel() {
  const theme = useTheme();
  const isWireframe = useIsWireframeTheme();
  const { selectedBadge, selectBadge } = useCompetencyExplorer(
    COMPETENCY_OVERVIEW,
    COMPETENCY_MATRIX_ROWS,
  );

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3 } }}>
      <Stack spacing={2.5}>
        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            background: isWireframe
              ? theme.palette.background.paper
              : 'linear-gradient(140deg, rgba(14, 116, 144, 0.08) 0%, rgba(255,255,255,1) 45%, rgba(244, 114, 182, 0.08) 100%)',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Box>
              <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.12em' }}>
                Competentietool
              </Typography>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                {COMPETENCY_OWNER_NAME}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 760 }}>
                Een visuele mockup van de competentietool op basis van de aangeleverde HTML-dump.
                De pagina combineert summary-badges, competency-assen en detailweergave in een
                leesbare MUI-layout die ook in wireframe-modus overeind blijft.
              </Typography>
            </Box>
            <Button disabled variant={isWireframe ? 'outlined' : 'contained'}>
              Save
            </Button>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.6fr) minmax(320px, 0.8fr)' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Stack spacing={2}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {COMPETENCY_OVERVIEW.map((group) => (
                <Paper
                  key={group.id}
                  sx={{
                    p: 2,
                    backgroundColor: isWireframe
                      ? theme.palette.background.paper
                      : alpha(theme.palette.primary.main, 0.04),
                  }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700 }}>
                    {group.title}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {group.items.map((badge) => {
                      const config = getBadgeVariantColor(
                        badge,
                        theme.palette.primary.main,
                        isWireframe,
                      );

                      return (
                        <Chip
                          key={badge.id}
                          label={badge.label}
                          variant={config.variant}
                          onClick={() => selectBadge(badge)}
                          clickable
                          sx={config.sx}
                        />
                      );
                    })}
                  </Stack>
                </Paper>
              ))}
            </Box>

            <Paper sx={{ overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Competency matrix
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  De competence-tool mockup toont nu alle vijf de architectuurlagen uit de
                  aangeleverde dump, uitgewerkt over de vijf capability-fases.
                </Typography>
              </Box>
              <Divider />

              <Box sx={{ p: 2, overflowX: 'auto' }}>
                <Box sx={{ minWidth: 940 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '220px repeat(5, minmax(120px, 1fr))',
                      gap: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <Box />
                    {COMPETENCY_COLUMNS.map((column) => (
                      <Paper
                        key={column.id}
                        sx={{
                          py: 1,
                          px: 1.25,
                          textAlign: 'center',
                          backgroundColor: isWireframe
                            ? theme.palette.background.default
                            : alpha(theme.palette.primary.main, 0.05),
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {column.label}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>

                  <Stack spacing={1.5}>
                    {COMPETENCY_MATRIX_ROWS.map((row) => (
                      <Box
                        key={row.id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '220px repeat(5, minmax(120px, 1fr))',
                          gap: 1.5,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            borderLeft: `4px solid ${row.accentColor}`,
                            backgroundColor: isWireframe
                              ? theme.palette.background.paper
                              : alpha(row.accentColor, 0.06),
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {row.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Track overzicht
                          </Typography>
                        </Paper>

                        {COMPETENCY_COLUMNS.map((column) => (
                          <Paper
                            key={`${row.id}-${column.id}`}
                            sx={{
                              p: 1.25,
                              minHeight: 132,
                              backgroundColor: 'background.paper',
                            }}
                          >
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                              {(row.cells[column.id] ?? []).map((badge) => {
                                const config = getBadgeVariantColor(
                                  badge,
                                  row.accentColor,
                                  isWireframe,
                                );

                                return (
                                  <Chip
                                    key={badge.id}
                                    label={badge.label}
                                    variant={config.variant}
                                    onClick={() => selectBadge(badge)}
                                    clickable
                                    sx={config.sx}
                                  />
                                );
                              })}
                            </Stack>
                          </Paper>
                        ))}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Paper>
          </Stack>

          <Paper
            sx={{
              position: { md: 'sticky' },
              top: { md: 24 },
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: isWireframe
                  ? theme.palette.background.default
                  : alpha(theme.palette.secondary?.main ?? theme.palette.primary.main, 0.06),
              }}
            >
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Selected competency
              </Typography>
              <Typography variant="h5">{selectedBadge?.label ?? 'Geen selectie'}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {selectedBadge?.title ?? 'Klik op een competency om details te bekijken.'}
              </Typography>
            </Box>

            <Stack spacing={2} sx={{ p: 2 }}>
              {selectedBadge ? (
                <>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={selectedBadge.domain} size="small" />
                    <Chip label={STATUS_LABELS[selectedBadge.state]} size="small" variant="outlined" />
                  </Stack>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      EN
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {selectedBadge.descriptionEn}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      NL
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {selectedBadge.descriptionNl}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Selecteer een competency in de matrix.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}
