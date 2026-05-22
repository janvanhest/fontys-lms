import type { KeyboardEvent, MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { formatDeadlineLabel } from '@/utils/activity-grouping';
import { ActivityCard } from './ActivityCard';
import { getTypeLabel, statusMeta } from './constants';
import type { ActivityGroupSection } from './types';
import type { Activity } from '@/types/activity';

type ActivityTimelineProps = {
  groups: ActivityGroupSection[];
  selectedActivityId: string | null;
  menuActivityId: string | null;
  menuAnchorEl: HTMLElement | null;
  onSelectActivity: (activityId: string) => void;
  onCardKeyDown: (event: KeyboardEvent<HTMLDivElement>, activityId: string) => void;
  onOpenMenu: (event: MouseEvent<HTMLButtonElement>, activityId: string) => void;
};

export function ActivityTimeline({
  groups,
  selectedActivityId,
  menuActivityId,
  menuAnchorEl,
  onSelectActivity,
  onCardKeyDown,
  onOpenMenu,
}: ActivityTimelineProps) {
  return groups.map((group) => (
    <Box key={group.groupKey}>
      <Divider sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: '100%',
            px: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            {group.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {group.rangeLabel}
          </Typography>
        </Box>
      </Divider>

      <Timeline
        sx={{
          m: 0,
          p: 0,
          [`& .MuiTimelineItem-root:before`]: { flex: 0, padding: 0 },
        }}
      >
        {group.items.map((activity: Activity, index) => {
          const isSelected = selectedActivityId === activity.id;
          const status = statusMeta[activity.status];

          return (
            <TimelineItem key={activity.id} sx={{ alignItems: 'stretch', minHeight: 0 }}>
              <TimelineSeparator sx={{ minWidth: 20 }}>
                <TimelineDot
                  sx={{
                    m: 0,
                    mt: 1.5,
                    boxShadow: 'none',
                    border: 'none',
                    bgcolor: status.color,
                    width: 10,
                    height: 10,
                  }}
                />
                {index < group.items.length - 1 ? (
                  <TimelineConnector
                    sx={{ bgcolor: alpha('#1976d2', 0.14), width: 2, borderRadius: 999 }}
                  />
                ) : null}
              </TimelineSeparator>

              <TimelineContent sx={{ py: 0.5, pr: 0 }}>
                <ActivityCard
                  activity={activity}
                  deadlineLabel={formatDeadlineLabel(activity.deadline)}
                  isSelected={isSelected}
                  menuOpen={menuActivityId === activity.id && Boolean(menuAnchorEl)}
                  statusColor={status.color}
                  statusLabel={status.label}
                  typeLabel={getTypeLabel(activity.type)}
                  onSelect={onSelectActivity}
                  onKeyDown={onCardKeyDown}
                  onOpenMenu={onOpenMenu}
                />
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Box>
  ));
}
