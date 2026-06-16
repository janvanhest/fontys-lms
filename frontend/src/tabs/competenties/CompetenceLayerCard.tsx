import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { CompetenceLevelBar } from './CompetenceLevelBar';
import { cellKey, progressStatusText, type CompetenceItem, type LayerGroup } from './competenceModel';

function summary(items: CompetenceItem[]): string {
  const achieved = items.filter((item) => typeof item.progress?.achievedLevel === 'number').length;
  return `${String(achieved)}/${String(items.length)} behaald`;
}

export function CompetenceLayerCard({
  group,
  selectedKey,
  onSelect,
  compact = false,
  highlightedKey = null,
}: {
  group: LayerGroup;
  selectedKey: string | null;
  onSelect: (item: CompetenceItem) => void;
  compact?: boolean;
  highlightedKey?: string | null;
}) {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 1,
          bgcolor: 'action.hover',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {group.layer}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          {summary(group.items)}
        </Typography>
      </Box>

      <Stack divider={<Divider />}>
        {group.items.map((item) => {
          const key = cellKey(item.layer, item.activity);
          const selected = key === selectedKey;
          const highlighted = key === highlightedKey;
          return (
            <ButtonBase
              key={key}
              data-competence-key={key}
              onClick={() => {
                onSelect(item);
              }}
              sx={(theme) => ({
                '@keyframes competenceCardHighlight': {
                  '0%, 100%': {
                    backgroundColor: selected ? theme.palette.action.selected : 'transparent',
                  },
                  '20%, 80%': { backgroundColor: alpha(theme.palette.primary.main, 0.18) },
                },
                display: 'block',
                width: '100%',
                textAlign: 'left',
                bgcolor: selected ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
                ...(highlighted && { animation: 'competenceCardHighlight 1.2s ease-in-out' }),
              })}
            >
              {compact ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                    px: 2,
                    py: 1.25,
                  }}
                >
                  <Typography variant="body2">{item.label}</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <CompetenceLevelBar cell={item.cell} progress={item.progress} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {progressStatusText(item.progress)}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto',
                    gap: 2,
                    alignItems: 'center',
                    px: 2,
                    py: 1.25,
                  }}
                >
                  <Typography variant="body2">{item.label}</Typography>
                  <CompetenceLevelBar cell={item.cell} progress={item.progress} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {progressStatusText(item.progress)}
                  </Typography>
                </Box>
              )}
            </ButtonBase>
          );
        })}
      </Stack>
    </Paper>
  );
}
