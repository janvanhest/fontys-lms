import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { ACTIVITY_GROUPS } from '../data/activities';
import { useActivitiesPanelState } from '../hooks/useActivitiesPanelState';
import { useIsWireframeTheme } from '../hooks/useIsWireframeTheme';
import type { ActivityGroup } from '../types';
import ActivityCard from './ActivityCard';
import ActivityDetailPanel from './ActivityDetailPanel';

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

interface ActivitiesPanelProps {
  open: boolean;
}

export default function ActivitiesPanel({ open }: ActivitiesPanelProps) {
  const theme = useTheme();
  const isWireframe = useIsWireframeTheme();
  const {
    cardStatuses,
    selectedActivity,
    selectedId,
    handleCardClick,
    clearSelection,
    handleStatusChange,
  } = useActivitiesPanelState(PANEL_GROUPS);

  const lineColor = isWireframe
    ? theme.palette.divider
    : alpha(theme.palette.primary.main, 0.25);

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
                <ActivityCard
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

      <ActivityDetailPanel activity={selectedActivity} onClose={clearSelection} />

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
