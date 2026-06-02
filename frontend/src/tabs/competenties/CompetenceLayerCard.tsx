import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
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
}: {
  group: LayerGroup;
  selectedKey: string | null;
  onSelect: (item: CompetenceItem) => void;
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
          bgcolor: 'action.hover',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {group.layer}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {summary(group.items)}
        </Typography>
      </Box>

      <Stack divider={<Divider />}>
        {group.items.map((item) => {
          const key = cellKey(item.layer, item.activity);
          const selected = key === selectedKey;
          return (
            <ButtonBase
              key={key}
              onClick={() => {
                onSelect(item);
              }}
              sx={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                bgcolor: selected ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
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
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {progressStatusText(item.progress)}
                </Typography>
              </Box>
            </ButtonBase>
          );
        })}
      </Stack>
    </Paper>
  );
}
