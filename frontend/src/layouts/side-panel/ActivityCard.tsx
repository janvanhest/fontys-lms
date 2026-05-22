import type { KeyboardEvent, MouseEvent } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { Activity } from '@/types/activity';

type ActivityCardProps = {
  activity: Activity;
  deadlineLabel: string;
  highlighted?: boolean;
  isSelected: boolean;
  menuOpen: boolean;
  statusColor: string;
  statusLabel: string;
  typeLabel: string;
  onSelect: (activityId: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>, activityId: string) => void;
  onOpenMenu: (event: MouseEvent<HTMLButtonElement>, activityId: string) => void;
};

export function ActivityCard({
  activity,
  deadlineLabel,
  highlighted = false,
  isSelected,
  menuOpen,
  statusColor,
  statusLabel,
  typeLabel,
  onSelect,
  onKeyDown,
  onOpenMenu,
}: ActivityCardProps) {
  return (
    <Paper
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      data-activity-id={activity.id}
      onClick={() => { onSelect(activity.id); }}
      onKeyDown={(event) => { onKeyDown(event, activity.id); }}
      elevation={isSelected ? 4 : 1}
      sx={(theme) => ({
        '@keyframes activityCardHighlight': {
          '0%, 100%': { boxShadow: 'none' },
          '20%, 80%': {
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.6)}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
          },
        },
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${statusColor}`,
        borderRadius: 2,
        p: 1.5,
        pr: 6,
        cursor: 'pointer',
        outline: 'none',
        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
        boxShadow: isSelected
          ? theme.shadows[4]
          : '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        transition: 'background-color 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
        '&:hover': { boxShadow: theme.shadows[2] },
        '&:focus-visible': {
          boxShadow: `${theme.shadows[2]}, 0 0 0 3px ${alpha(theme.palette.primary.main, 0.34)}`,
        },
        ...(highlighted && {
          animation: 'activityCardHighlight 1.2s ease-in-out',
        }),
      })}
    >
      <Tooltip title="Opties" placement="left" enterDelay={600}>
        <IconButton
          size="small"
          aria-label={`Open menu voor ${activity.title}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={(event) => { onOpenMenu(event, activity.id); }}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Stack spacing={1.25}>
        <Chip label={typeLabel} color="primary" size="small" sx={{ alignSelf: 'flex-start' }} />

        <Typography variant="subtitle2" sx={{ pr: 1.5 }}>
          {activity.title}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 1,
            minHeight: 34,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {deadlineLabel}
          </Typography>
          <Typography variant="body2" sx={{ color: statusColor, fontWeight: 600, textAlign: 'right' }}>
            {statusLabel}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
