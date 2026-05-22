import type { KeyboardEvent, MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { formatDeadlineLabel } from '@/utils/activity-grouping';
import { ActivityCard } from './ActivityCard';
import { getTypeLabel, statusMeta } from './constants';
import type { ActivityGroupSection } from './types';
import type { Activity } from '@/types/activity';

// Dot is offset 12px from the item top (mt: 1.5). Dot height = 10px.
const DOT_TOP = 12; // px
const DOT_HEIGHT = 10; // px

type ActivityTimelineProps = {
  groups: ActivityGroupSection[];
  highlightedActivityId: string | null;
  selectedActivityId: string | null;
  menuActivityId: string | null;
  menuAnchorEl: HTMLElement | null;
  onSelectActivity: (activityId: string) => void;
  onCardKeyDown: (event: KeyboardEvent<HTMLDivElement>, activityId: string) => void;
  onOpenMenu: (event: MouseEvent<HTMLButtonElement>, activityId: string) => void;
};

export function ActivityTimeline({
  groups,
  highlightedActivityId,
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

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {group.items.map((activity: Activity, index) => {
          const isLast = index === group.items.length - 1;
          const isSelected = selectedActivityId === activity.id;
          const status = statusMeta[activity.status];

          return (
            <Box key={activity.id} sx={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Separator column with dot and connector */}
              <Box
                sx={{
                  width: 20,
                  flexShrink: 0,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  overflow: 'visible',
                }}
              >
                {/* Dot */}
                <Box
                  sx={{
                    mt: `${DOT_TOP}px`,
                    width: DOT_HEIGHT,
                    height: DOT_HEIGHT,
                    borderRadius: '50%',
                    bgcolor: status.color,
                    flexShrink: 0,
                    zIndex: 1,
                    position: 'relative',
                  }}
                />

                {/* Connector: absolutely positioned from dot-bottom to next item's dot-top */}
                {!isLast ? (
                  <Box
                    sx={(theme) => ({
                      position: 'absolute',
                      top: `${DOT_TOP + DOT_HEIGHT}px`,
                      // Extends into next item by DOT_TOP px to meet that item's dot
                      bottom: `-${DOT_TOP}px`,
                      width: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.18),
                      borderRadius: '0 0 2px 2px',
                    })}
                  />
                ) : null}
              </Box>

              {/* Card */}
              <Box sx={{ py: 0.5, flex: 1, minWidth: 0 }}>
                <ActivityCard
                  activity={activity}
                  deadlineLabel={formatDeadlineLabel(activity.deadline)}
                  highlighted={highlightedActivityId === activity.id}
                  isSelected={isSelected}
                  menuOpen={menuActivityId === activity.id && Boolean(menuAnchorEl)}
                  statusColor={status.color}
                  statusLabel={status.label}
                  typeLabel={getTypeLabel(activity.type)}
                  onSelect={onSelectActivity}
                  onKeyDown={onCardKeyDown}
                  onOpenMenu={onOpenMenu}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  ));
}
