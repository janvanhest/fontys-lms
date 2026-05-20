import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { activitiesQueryOptions } from '@/api/activities';
import { groupActivities } from '@/utils/activity-grouping';
import { ActivityDetails } from './ActivityDetails';
import { ActivityMenus } from './ActivityMenus';
import { ActivityTimeline } from './ActivityTimeline';
import type { ActivityGroupSection, OpenSubmenu } from './types';
import type { Activity, ActivityStatus, ActivityType } from '@/types/activity';

export function ActivitiesPanel() {
  const { data: activities = [] } = useQuery(activitiesQueryOptions);

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuActivityId, setMenuActivityId] = useState<string | null>(null);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<HTMLElement | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<OpenSubmenu>(null);

  const [localOverrides, setLocalOverrides] = useState<
    Record<string, Partial<Pick<Activity, 'status' | 'type'>>>
  >({});

  const mergedActivities = useMemo(
    () =>
      activities.map((a) =>
        localOverrides[a.id] ? { ...a, ...localOverrides[a.id] } : a,
      ),
    [activities, localOverrides],
  );

  const groupedActivities: ActivityGroupSection[] = useMemo(
    () => groupActivities(mergedActivities),
    [mergedActivities],
  );

  const selectedActivity =
    mergedActivities.find((a) => a.id === selectedActivityId) ?? null;

  const closeMenus = () => {
    setMenuAnchorEl(null);
    setMenuActivityId(null);
    setSubmenuAnchorEl(null);
    setOpenSubmenu(null);
  };

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>, activityId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuActivityId(activityId);
    setSubmenuAnchorEl(null);
    setOpenSubmenu(null);
  };

  const handleOpenSubmenu = (
    event: MouseEvent<HTMLElement>,
    submenu: Exclude<OpenSubmenu, null>,
  ) => {
    event.stopPropagation();
    setSubmenuAnchorEl(event.currentTarget);
    setOpenSubmenu(submenu);
  };

  const handleStatusChange = (status: ActivityStatus) => {
    if (!menuActivityId) return;
    setLocalOverrides((prev) => ({
      ...prev,
      [menuActivityId]: { ...prev[menuActivityId], status },
    }));
    closeMenus();
  };

  const handleTypeChange = (nextType: ActivityType) => {
    if (!menuActivityId) return;
    setLocalOverrides((prev) => ({
      ...prev,
      [menuActivityId]: { ...prev[menuActivityId], type: nextType },
    }));
    closeMenus();
  };

  const handleSelectActivity = (activityId: string) => {
    setSelectedActivityId(activityId);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, activityId: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if ((event.target as HTMLElement).closest('button,[role="button"]')) return;
    event.preventDefault();
    handleSelectActivity(activityId);
  };

  const closeSubmenu = () => {
    setSubmenuAnchorEl(null);
    setOpenSubmenu(null);
  };

  return (
    <>
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6">Activiteiten</Typography>
        <Typography variant="body2" color="text.secondary">
          Tijdlijn van activiteiten en deadlines rond deze student.
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, py: 1.5 }}>
        <Stack spacing={2}>
          <ActivityTimeline
            groups={groupedActivities}
            selectedActivityId={selectedActivityId}
            menuActivityId={menuActivityId}
            menuAnchorEl={menuAnchorEl}
            onSelectActivity={handleSelectActivity}
            onCardKeyDown={handleCardKeyDown}
            onOpenMenu={handleOpenMenu}
          />
        </Stack>
      </Box>

      <Collapse in={!!selectedActivity} timeout="auto" unmountOnExit>
        {selectedActivity ? (
          <ActivityDetails
            activity={selectedActivity}
            onClose={() => { setSelectedActivityId(null); }}
          />
        ) : null}
      </Collapse>

      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Button fullWidth variant="contained" startIcon={<AddIcon />}>
          Nieuwe activiteit
        </Button>
      </Box>

      <ActivityMenus
        activities={mergedActivities}
        menuActivityId={menuActivityId}
        menuAnchorEl={menuAnchorEl}
        submenuAnchorEl={submenuAnchorEl}
        openSubmenu={openSubmenu}
        onCloseMenus={closeMenus}
        onOpenSubmenu={handleOpenSubmenu}
        onCloseSubmenu={closeSubmenu}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}
