import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useSetCompetence } from '@/api/competences';
import type { CompetenceItem } from './competenceModel';

function LevelSelect({
  label,
  value,
  levels,
  onChange,
}: {
  label: string;
  value: number | null;
  levels: number[];
  onChange: (value: number | null) => void;
}) {
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value === null ? '' : String(value)}
      onChange={(event) => {
        onChange(event.target.value === '' ? null : Number(event.target.value));
      }}
      sx={{ minWidth: 150 }}
    >
      <MenuItem value="">Geen</MenuItem>
      {levels.map((level) => (
        <MenuItem key={level} value={String(level)}>
          Niveau {String(level)}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function CompetenceEditDialog({
  item,
  onClose,
}: {
  item: CompetenceItem;
  onClose: () => void;
}) {
  const setCompetence = useSetCompetence();
  const [achieved, setAchieved] = useState<number | null>(item.progress?.achievedLevel ?? null);
  const [target, setTarget] = useState<number | null>(item.progress?.targetLevel ?? null);
  const [explanation, setExplanation] = useState<string>(item.progress?.explanation ?? '');

  const levels: number[] = [];
  for (let level = item.cell.minLevel; level <= item.cell.maxLevel; level++) levels.push(level);

  const handleSave = () => {
    const trimmed = explanation.trim();
    setCompetence.mutate(
      {
        layer: item.layer,
        hboiActivity: item.activity,
        achievedLevel: achieved,
        targetLevel: target,
        explanation: trimmed === '' ? null : trimmed,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {item.label}
        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          {item.layer}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
            <LevelSelect label="Behaald niveau" value={achieved} levels={levels} onChange={setAchieved} />
            <LevelSelect label="Doelniveau" value={target} levels={levels} onChange={setTarget} />
          </Stack>
          <TextField
            label="Onderbouwing"
            multiline
            minRows={3}
            value={explanation}
            onChange={(event) => {
              setExplanation(event.target.value);
            }}
          />
          {setCompetence.isError && (
            <Typography variant="caption" color="error">
              Opslaan mislukt. Probeer het opnieuw.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={setCompetence.isPending}>
          Annuleren
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={setCompetence.isPending}>
          Opslaan
        </Button>
      </DialogActions>
    </Dialog>
  );
}
