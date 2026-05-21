import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { KeyboardEvent, MouseEvent } from 'react';
import { ActivityTimeline } from './ActivityTimeline';
import type { ActivityGroupSection } from './types';

type ActivitiesPanelContentProps = {
  error: Error | null;
  groups: ActivityGroupSection[];
  isError: boolean;
  isLoading: boolean;
  menuActivityId: string | null;
  menuAnchorEl: HTMLElement | null;
  onCardKeyDown: (event: KeyboardEvent<HTMLDivElement>, activityId: string) => void;
  onOpenMenu: (event: MouseEvent<HTMLButtonElement>, activityId: string) => void;
  onSelectActivity: (activityId: string) => void;
  selectedActivityId: string | null;
  totalActivities: number;
};

export function ActivitiesPanelContent({
  error,
  groups,
  isError,
  isLoading,
  menuActivityId,
  menuAnchorEl,
  onCardKeyDown,
  onOpenMenu,
  onSelectActivity,
  selectedActivityId,
  totalActivities,
}: ActivitiesPanelContentProps) {
  if (isLoading) {
    return (
      <Typography variant="body2" color="text.secondary">
        Activiteiten laden...
      </Typography>
    );
  }

  if (isError) {
    return (
      <Typography variant="body2" color="error.main">
        {error instanceof Error ? error.message : 'Kon activiteiten niet ophalen'}
      </Typography>
    );
  }

  if (totalActivities === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nog geen activiteiten.
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <ActivityTimeline
        groups={groups}
        selectedActivityId={selectedActivityId}
        menuActivityId={menuActivityId}
        menuAnchorEl={menuAnchorEl}
        onSelectActivity={onSelectActivity}
        onCardKeyDown={onCardKeyDown}
        onOpenMenu={onOpenMenu}
      />
    </Stack>
  );
}
