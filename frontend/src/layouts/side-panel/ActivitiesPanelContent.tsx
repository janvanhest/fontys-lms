import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { KeyboardEvent, MouseEvent } from 'react';
import { ActivityTimeline } from './ActivityTimeline';
import type { ActivityGroupSection } from './types';

type ActivitiesPanelContentProps = {
  error: Error | null;
  groups: ActivityGroupSection[];
  highlightedActivityId: string | null;
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

function ActivityCardSkeleton() {
  return (
    <Skeleton
      variant="rounded"
      height={88}
      sx={{ borderRadius: 2, transform: 'none' }}
      animation="wave"
    />
  );
}

export function ActivitiesPanelContent({
  error,
  groups,
  highlightedActivityId,
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
      <Stack spacing={1.5}>
        <ActivityCardSkeleton />
        <ActivityCardSkeleton />
        <ActivityCardSkeleton />
      </Stack>
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          py: 5,
          px: 2,
          textAlign: 'center',
        }}
      >
        <EventNoteOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Nog geen activiteiten
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Klik op "Nieuwe activiteit" om te beginnen.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <ActivityTimeline
        groups={groups}
        highlightedActivityId={highlightedActivityId}
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
