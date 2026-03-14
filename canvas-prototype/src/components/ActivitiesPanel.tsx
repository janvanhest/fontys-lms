import type { KeyboardEvent, MouseEvent } from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import {
  ACTIVITY_TYPES,
  STATUS_COLORS,
  STATUS_LABELS,
  STATUSES,
} from '../constants/activityStatus';
import { ACTIVITY_GROUPS } from '../data/activities';
import { useIsWireframeTheme } from '../hooks/useIsWireframeTheme';
import type {
  Activity,
  ActivityGroup,
  ActivityStatusKey,
  CardStatusMap,
} from '../types';
import ActivityDetailPanel from './ActivityDetailPanel';
import TimelineDot from './TimelineDot';

const DOT_COL = 24;

const EARLIER_GROUP: ActivityGroup = {
  id: 'eerder',
  label: 'eerder',
  date: 'voor 14 mrt',
  activities: [
    {
      id: 'act-earlier-1',
      tag: 'Challenge',
      title: 'Challenge markering',
      deadline: 'wo 5 mrt',
      statusKey: 'afgerond',
      status: 'afgerond',
      description: 'Markering en planning voor de challenge zijn vastgelegd en afgerond.',
      competentie: '[gekoppelde competentie]',
      actieLabel: 'Bekijk challenge',
    },
    {
      id: 'act-earlier-2',
      tag: 'Challenge',
      title: 'Gekozen challenge',
      deadline: 'vr 7 mrt',
      statusKey: 'afgerond',
      status: 'afgerond',
      description:
        'De challengekeuze is bevestigd en gekoppeld aan de leerdoelen voor deze periode.',
      competentie: '[gekoppelde competentie]',
      actieLabel: 'Bekijk challenge',
    },
  ],
};

const PANEL_GROUPS: ActivityGroup[] = [EARLIER_GROUP, ...ACTIVITY_GROUPS];

function buildInitialStatuses(): CardStatusMap {
  const map: CardStatusMap = {};

  for (const group of PANEL_GROUPS) {
    for (const activity of group.activities) {
      map[activity.id] = activity.statusKey ?? 'open';
    }
  }

  return map;
}

interface GroupSeparatorProps {
  label: string;
  date: string;
}

function GroupSeparator({ label, date }: GroupSeparatorProps) {
  const theme = useTheme();
  const isWireframe = useIsWireframeTheme();

  return (
    <Box sx={{ mb: 2 }}>
      <Divider
        sx={{
          '&::before, &::after': {
            borderColor: isWireframe ? '#ccc' : theme.palette.divider,
          },
          '& .MuiDivider-wrapper': {
            px: 0.75,
            color: isWireframe ? '#999' : theme.palette.text.secondary,
            fontSize: isWireframe ? 10 : 11,
            fontFamily: isWireframe ? '"Courier New", Courier, monospace' : 'inherit',
            textTransform: isWireframe ? 'uppercase' : 'none',
            letterSpacing: isWireframe ? '0.08em' : 0,
          },
        }}
      >
        {label}
      </Divider>

      <Typography
        sx={{
          display: 'block',
          mt: 0.5,
          pl: `${DOT_COL}px`,
          fontSize: isWireframe ? 9 : 11,
          fontStyle: isWireframe ? 'italic' : 'normal',
          color: isWireframe ? '#bbb' : theme.palette.text.disabled,
          lineHeight: 1,
        }}
      >
        {date}
      </Typography>
    </Box>
  );
}

interface ActivityTimelineCardProps {
  activity: Activity;
  status: ActivityStatusKey;
  onStatusChange: (status: ActivityStatusKey) => void;
  isSelected: boolean;
  onClick: () => void;
}

function ActivityTimelineCard({
  activity,
  status,
  onStatusChange,
  isSelected,
  onClick,
}: ActivityTimelineCardProps) {
  const theme = useTheme();
  const isWireframe = useIsWireframeTheme();
  const primary = theme.palette.primary.main;
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const statusColor = STATUS_COLORS[status];
  const isCompleted = status === 'afgerond';

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
      <Box sx={{ width: DOT_COL, flexShrink: 0, display: 'flex', justifyContent: 'center', pt: '14px' }}>
        <TimelineDot variant="card" isSelected={isSelected} />
      </Box>

      <Paper
        elevation={isWireframe ? 0 : isSelected ? 4 : 2}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
          }
        }}
        aria-pressed={isSelected}
        sx={{
          flex: 1,
          py: 1.5,
          px: 2,
          cursor: 'pointer',
          border: '1px solid',
          borderColor: isWireframe ? '#bbb' : 'divider',
          borderLeft: `4px solid ${statusColor}`,
          backgroundColor: isWireframe
            ? theme.palette.background.default
            : theme.palette.background.paper,
          opacity: !isWireframe && isCompleted ? 0.75 : 1,
          transition: 'background-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
          '&:hover': {
            backgroundColor: isWireframe ? theme.palette.action.hover : alpha(primary, 0.07),
          },
          '&:focus-visible': {
            outline: `2px solid ${primary}`,
            outlineOffset: 2,
          },
          ...(isSelected
            ? {
                boxShadow: isWireframe ? 'none' : theme.shadows[4],
                backgroundColor: isWireframe
                  ? theme.palette.action.selected
                  : alpha(primary, 0.04),
              }
            : {}),
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
          <Chip
            label={activity.tag}
            size="small"
            variant={isWireframe ? 'outlined' : 'filled'}
            sx={{
              height: 18,
              fontSize: 10,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              ...(isWireframe
                ? {}
                : {
                    backgroundColor: alpha(primary, 0.12),
                    color: primary,
                    fontWeight: 'bold',
                    border: 'none',
                  }),
            }}
          />

          <IconButton
            size="small"
            onClick={openMenu}
            aria-label="Opties"
            sx={{
              p: 0.25,
              mr: -0.75,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Typography variant="body2" sx={{ mb: 0.75, lineHeight: 1.35 }}>
          {activity.title}
        </Typography>

        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {activity.deadline}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: isWireframe ? 'text.secondary' : statusColor,
              fontWeight: isWireframe ? 'normal' : 'medium',
            }}
          >
            {STATUS_LABELS[status]}
          </Typography>
        </Stack>
      </Paper>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        onClick={(event) => event.stopPropagation()}
      >
        <MenuItem onClick={closeMenu}>Hernoem titel</MenuItem>
        <MenuItem onClick={closeMenu}>Bewerk</MenuItem>
        <Divider />
        {ACTIVITY_TYPES.map((type) => (
          <MenuItem key={type} onClick={closeMenu}>
            {type}
          </MenuItem>
        ))}
        <Divider />
        {STATUSES.map((nextStatus) => (
          <MenuItem
            key={nextStatus}
            selected={nextStatus === status}
            onClick={() => {
              onStatusChange(nextStatus);
              closeMenu();
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: STATUS_COLORS[nextStatus],
                mr: 1.5,
                flexShrink: 0,
              }}
            />
            {STATUS_LABELS[nextStatus]}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

interface ActivitiesPanelProps {
  open: boolean;
}

export default function ActivitiesPanel({ open }: ActivitiesPanelProps) {
  const theme = useTheme();
  const isWireframe = useIsWireframeTheme();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cardStatuses, setCardStatuses] = useState<CardStatusMap>(buildInitialStatuses);

  const handleStatusChange = (id: string, status: ActivityStatusKey) => {
    setCardStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const lineColor = isWireframe
    ? theme.palette.divider
    : alpha(theme.palette.primary.main, 0.25);

  const selectedActivity =
    PANEL_GROUPS.flatMap((group) => group.activities).find((activity) => activity.id === selectedId) ??
    null;

  const handleCardClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  return (
    <Box
      sx={{
        width: open ? 'max(320px, 20vw)' : 0,
        minWidth: open ? 'max(320px, 20vw)' : 0,
        overflow: 'hidden',
        transition: 'width 0.25s ease, min-width 0.25s ease',
        borderLeft: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        backgroundColor: 'background.default',
      }}
    >
      <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Activiteiten
        </Typography>
      </Box>
      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5 }}>
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              left: `${DOT_COL / 2}px`,
              top: 0,
              bottom: 0,
              width: '1px',
              backgroundColor: lineColor,
              pointerEvents: 'none',
            }}
          />

          {PANEL_GROUPS.map((group) => (
            <Box key={group.id} sx={{ mb: 3.5, '&:last-child': { mb: 1 } }}>
              <GroupSeparator label={group.label} date={group.date} />

              {group.activities.map((activity) => (
                <ActivityTimelineCard
                  key={activity.id}
                  activity={activity}
                  status={cardStatuses[activity.id] ?? 'open'}
                  onStatusChange={(status) => handleStatusChange(activity.id, status)}
                  isSelected={selectedId === activity.id}
                  onClick={() => handleCardClick(activity.id)}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      <ActivityDetailPanel activity={selectedActivity} onClose={() => setSelectedId(null)} />

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          p: 1.5,
          borderTop: `1px solid ${isWireframe ? '#ccc' : theme.palette.divider}`,
          backgroundColor: isWireframe ? '#f9f9f9' : theme.palette.background.paper,
        }}
      >
        <Button variant="outlined" fullWidth>
          + Nieuwe activiteit
        </Button>
      </Box>

      <Divider />
      <Typography variant="caption" sx={{ px: 2, py: 0.75, color: 'text.secondary', display: 'block' }}>
        panel: activiteiten sidebar
      </Typography>
    </Box>
  );
}
