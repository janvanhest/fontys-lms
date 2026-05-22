import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import type { ActivityType } from '@/types/activity';

type ActivityFormFieldsProps = {
  competencyLabel: string;
  deadline: string;
  description: string;
  isEdit: boolean;
  isPending: boolean;
  mutationError: Error | null;
  onCompetencyLabelChange: (value: string) => void;
  onDeadlineChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onTypeChange: (value: ActivityType) => void;
  title: string;
  type: ActivityType;
};

const typeToggleOptions: { icon: ReactNode; label: string; value: ActivityType }[] = [
  { value: 'opdracht', label: 'Opdracht', icon: <AssignmentOutlinedIcon fontSize="small" /> },
  { value: 'workshop', label: 'Workshop', icon: <GroupsOutlinedIcon fontSize="small" /> },
  { value: 'competentie', label: 'Competentie', icon: <SchoolOutlinedIcon fontSize="small" /> },
  { value: 'challenge', label: 'Challenge', icon: <EmojiEventsOutlinedIcon fontSize="small" /> },
];

export function ActivityFormFields({
  competencyLabel,
  deadline,
  description,
  isEdit,
  isPending,
  mutationError,
  onCompetencyLabelChange,
  onDeadlineChange,
  onDescriptionChange,
  onTitleChange,
  onTypeChange,
  title,
  type,
}: ActivityFormFieldsProps) {
  return (
    <Stack spacing={2.5} sx={{ mt: 1 }}>
      <TextField
        label="Titel"
        required
        fullWidth
        value={title}
        onChange={(event) => {
          onTitleChange(event.target.value);
        }}
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
            onChange={(_, value: ActivityType | null) => {
              if (value) onTypeChange(value);
            }}
            disabled={isPending}
            fullWidth
            size="small"
          >
            {typeToggleOptions.map((option) => (
              <ToggleButton key={option.value} value={option.value} sx={{ gap: 0.75, py: 1 }}>
                {option.icon}
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {option.label}
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
        onChange={(event) => {
          onDescriptionChange(event.target.value);
        }}
        disabled={isPending}
      />

      <TextField
        label="Deadline"
        type="date"
        fullWidth
        value={deadline}
        onChange={(event) => {
          onDeadlineChange(event.target.value);
        }}
        disabled={isPending}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        label="Gekoppelde competentie"
        fullWidth
        value={competencyLabel}
        onChange={(event) => {
          onCompetencyLabelChange(event.target.value);
        }}
        disabled={isPending}
      />

      {mutationError ? (
        <Alert severity="error">
          {mutationError instanceof Error ? mutationError.message : 'Er is iets misgegaan'}
        </Alert>
      ) : null}
    </Stack>
  );
}
