import { useState, type SubmitEventHandler } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useCreateActivity, useUpdateActivity } from '@/api/activities';
import type { Activity, ActivityType } from '@/types/activity';

type ActivityFormDialogProps = {
  open: boolean;
  activity: Activity | null;
  onClose: () => void;
};

const typeToggleOptions: { value: ActivityType; label: string; icon: React.ReactNode }[] = [
  { value: 'opdracht', label: 'Opdracht', icon: <AssignmentOutlinedIcon fontSize="small" /> },
  { value: 'workshop', label: 'Workshop', icon: <GroupsOutlinedIcon fontSize="small" /> },
  { value: 'competentie', label: 'Competentie', icon: <SchoolOutlinedIcon fontSize="small" /> },
  { value: 'challenge', label: 'Challenge', icon: <EmojiEventsOutlinedIcon fontSize="small" /> },
];

export function ActivityFormDialog({ open, activity, onClose }: ActivityFormDialogProps) {
  const isEdit = activity !== null;
  const dialogKey = `${activity?.id ?? 'new'}:${open ? 'open' : 'closed'}`;

  const [title, setTitle] = useState(() => activity?.title ?? '');
  const [type, setType] = useState<ActivityType>(() => activity?.type ?? 'opdracht');
  const [description, setDescription] = useState(() => activity?.description ?? '');
  const [deadline, setDeadline] = useState(() => activity?.deadline ?? '');
  const [competencyLabel, setCompetencyLabel] = useState(() => activity?.competencyLabel ?? '');

  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const isPending = createActivity.isPending || updateActivity.isPending;
  const mutationError = createActivity.error ?? updateActivity.error;

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
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
    <Dialog key={dialogKey} open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                flexShrink: 0,
              }}
            >
              {isEdit ? <EditOutlinedIcon /> : <AddCircleOutlineIcon />}
            </Box>
            <Box>
              <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>
                {isEdit ? 'Activiteit bewerken' : 'Nieuwe activiteit'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit
                  ? activity.title
                  : 'Vul de gegevens in voor de nieuwe activiteit'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
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
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  Soort *
                </Typography>
                <ToggleButtonGroup
                  value={type}
                  exclusive
                  onChange={(_, val: ActivityType | null) => { if (val) setType(val); }}
                  disabled={isPending}
                  fullWidth
                  size="small"
                >
                  {typeToggleOptions.map((opt) => (
                    <ToggleButton key={opt.value} value={opt.value} sx={{ gap: 0.75, py: 1 }}>
                      {opt.icon}
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {opt.label}
                      </Typography>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
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

            {mutationError ? (
              <Alert severity="error">
                {mutationError instanceof Error ? mutationError.message : 'Er is iets misgegaan'}
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={onClose} disabled={isPending} color="inherit">
            Annuleren
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending || !title.trim()}
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isPending ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
