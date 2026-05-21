import { useEffect, useState, type FormEvent } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useCreateActivity, useUpdateActivity } from '@/api/activities';
import type { Activity, ActivityType } from '@/types/activity';
import { subtypeOptions } from './constants';

type ActivityFormDialogProps = {
  open: boolean;
  activity: Activity | null;
  onClose: () => void;
};

export function ActivityFormDialog({ open, activity, onClose }: ActivityFormDialogProps) {
  const isEdit = activity !== null;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<ActivityType>('opdracht');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [competencyLabel, setCompetencyLabel] = useState('');

  useEffect(() => {
    setTitle(activity?.title ?? '');
    setType(activity?.type ?? 'opdracht');
    setDescription(activity?.description ?? '');
    setDeadline(activity?.deadline ?? '');
    setCompetencyLabel(activity?.competencyLabel ?? '');
  }, [activity, open]);

  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const isPending = createActivity.isPending || updateActivity.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateActivity.mutate(
        {
          id: activity.id,
          title,
          description: description || undefined,
          deadline: deadline || undefined,
          competencyLabel: competencyLabel || undefined,
        },
        { onSuccess: onClose },
      );
    } else {
      createActivity.mutate(
        {
          title,
          type,
          description: description || undefined,
          deadline: deadline || undefined,
          competencyLabel: competencyLabel || undefined,
        },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Activiteit bewerken' : 'Nieuwe activiteit'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Titel"
              required
              fullWidth
              value={title}
              onChange={(e) => { setTitle(e.target.value); }}
              disabled={isPending}
              autoFocus
            />
            {!isEdit && (
              <TextField
                select
                label="Soort"
                required
                fullWidth
                value={type}
                onChange={(e) => { setType(e.target.value as ActivityType); }}
                disabled={isPending}
              >
                {subtypeOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              label="Beschrijving"
              multiline
              minRows={3}
              fullWidth
              value={description}
              onChange={(e) => { setDescription(e.target.value); }}
              disabled={isPending}
            />
            <TextField
              label="Deadline"
              type="date"
              fullWidth
              value={deadline}
              onChange={(e) => { setDeadline(e.target.value); }}
              disabled={isPending}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Gekoppelde competentie"
              fullWidth
              value={competencyLabel}
              onChange={(e) => { setCompetencyLabel(e.target.value); }}
              disabled={isPending}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>
            Annuleren
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending || !title.trim()}
          >
            {isPending ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
