import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { CompetenceItem } from './competenceModel';
import { CompetenceEditDialog } from './CompetenceEditDialog';

// Sticky aan de bovenkant, maar nooit hoger dan het scherm: bij lange inhoud
// scrollt het paneel intern in plaats van onder de vouw te verdwijnen.
const panelSx = {
  p: 3,
  position: { lg: 'sticky' },
  top: { lg: 24 },
  maxHeight: { lg: 'calc(100dvh - 48px)' },
  overflowY: { lg: 'auto' },
} as const;

export function CompetenceDetailPanel({ item }: { item: CompetenceItem | null }) {
  const [isEditing, setIsEditing] = useState(false);

  if (!item) {
    return (
      <Paper variant="outlined" sx={panelSx}>
        <Typography color="text.secondary">
          Selecteer een competentie om de niveaus en je onderbouwing te zien.
        </Typography>
      </Paper>
    );
  }

  const achieved = item.progress?.achievedLevel ?? null;
  const target = item.progress?.targetLevel ?? null;
  const levels = [...item.cell.levels].sort((a, b) => a.level - b.level);

  return (
    <Paper variant="outlined" sx={panelSx}>
      <Typography variant="overline" color="text.secondary">
        {item.layer}
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {item.label}
      </Typography>

      <Stack spacing={1.5}>
        {levels.map((level) => {
          const isAchieved = achieved !== null && level.level <= achieved;
          const isTarget = level.level === target;
          return (
            <Box key={level.level}>
              <Stack direction="row" spacing={1} sx={{ mb: 0.25, alignItems: 'center' }}>
                <Typography variant="subtitle2">Niveau {String(level.level)}</Typography>
                {isAchieved && <Chip label="behaald" size="small" color="success" />}
                {isTarget && <Chip label="doel" size="small" color="warning" />}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {level.description}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Jouw onderbouwing
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {item.progress?.explanation ? item.progress.explanation : 'Nog niets ingevuld.'}
      </Typography>
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          setIsEditing(true);
        }}
      >
        Bewerken
      </Button>

      {isEditing && (
        <CompetenceEditDialog
          item={item}
          onClose={() => {
            setIsEditing(false);
          }}
        />
      )}
    </Paper>
  );
}
