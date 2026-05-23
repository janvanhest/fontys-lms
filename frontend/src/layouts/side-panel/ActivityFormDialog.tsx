import { useState, type SubmitEventHandler } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useCreateActivity, useUpdateActivity } from '@/api/activities';
import type { Activity, ActivityType } from '@/types/activity';
import { ActivityFormFields } from './ActivityFormFields';
import { getActivityFormState } from './activityFormState';

type ActivityFormDialogProps = {
  open: boolean;
  activity: Activity | null;
  onClose: () => void;
};

export function ActivityFormDialog({ open, activity, onClose }: ActivityFormDialogProps) {
  const isEdit = activity !== null;
  const initialFormState = getActivityFormState(activity);

  const [title, setTitle] = useState(() => initialFormState.title);
  const [type, setType] = useState<ActivityType>(() => initialFormState.type);
  const [description, setDescription] = useState(() => initialFormState.description);
  const [deadline, setDeadline] = useState(() => initialFormState.deadline);
  const [competencyLabel, setCompetencyLabel] = useState(() => initialFormState.competencyLabel);

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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'primary.main',
                flexShrink: 0,
              }}
            >
              {isEdit ? <EditOutlinedIcon /> : <AddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>
                {isEdit ? 'Activiteit bewerken' : 'Nieuwe activiteit'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEdit ? activity.title : 'Vul de gegevens in voor de nieuwe activiteit'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <ActivityFormFields
            competencyLabel={competencyLabel}
            deadline={deadline}
            description={description}
            isEdit={isEdit}
            isPending={isPending}
            mutationError={mutationError}
            onCompetencyLabelChange={setCompetencyLabel}
            onDeadlineChange={setDeadline}
            onDescriptionChange={setDescription}
            onTitleChange={setTitle}
            onTypeChange={setType}
            title={title}
            type={type}
          />
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
