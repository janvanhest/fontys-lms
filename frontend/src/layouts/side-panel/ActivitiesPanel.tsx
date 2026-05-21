import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { useQuery } from '@tanstack/react-query';
import { activitiesQueryOptions, useUpdateActivity } from '@/api/activities';
import { groupActivities } from '@/utils/activity-grouping';
import { ActivityDetails } from './ActivityDetails';
import { ActivityFormDialog } from './ActivityFormDialog';
import { ActivityMenus } from './ActivityMenus';
import { ActivitiesPanelContent } from './ActivitiesPanelContent';
import { ActivitiesPanelHeader } from './ActivitiesPanelHeader';
import type { ActivityGroupSection, OpenSubmenu } from './types';
import type { Activity, ActivityStatus, ActivityType } from '@/types/activity';

export function ActivitiesPanel() {
  const {
    data: activities = [],
    isLoading,
    isError,
    error,
  } = useQuery(activitiesQueryOptions);

  const updateActivity = useUpdateActivity();

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [menuActivityId, setMenuActivityId] = useState<string | null>(null);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<HTMLElement | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<OpenSubmenu>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);

  const groupedActivities: ActivityGroupSection[] = useMemo(
    () => groupActivities(activities),
    [activities],
  );

  const selectedActivity = activities.find((a) => a.id === selectedActivityId) ?? null;

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
    updateActivity.mutate({ id: menuActivityId, status });
    closeMenus();
  };

  const handleTypeChange = (nextType: ActivityType) => {
    if (!menuActivityId) return;
    updateActivity.mutate({ id: menuActivityId, type: nextType });
    closeMenus();
  };

  const handleEdit = (activity: Activity) => {
    setEditActivity(activity);
    setFormOpen(true);
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

  return (
    <>
      <ActivitiesPanelHeader />

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1.5, py: 1.5 }}>
        <ActivitiesPanelContent
          error={error}
          groups={groupedActivities}
          isError={isError}
          isLoading={isLoading}
          menuActivityId={menuActivityId}
          menuAnchorEl={menuAnchorEl}
          onCardKeyDown={handleCardKeyDown}
          onOpenMenu={handleOpenMenu}
          onSelectActivity={handleSelectActivity}
          selectedActivityId={selectedActivityId}
          totalActivities={activities.length}
        />
      </Box>

      <Collapse in={!!selectedActivity} timeout="auto" unmountOnExit>
        {selectedActivity ? (
          <ActivityDetails
            activity={selectedActivity}
            onClose={() => { setSelectedActivityId(null); }}
            onEdit={handleEdit}
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
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditActivity(null); setFormOpen(true); }}
        >
          Nieuwe activiteit
        </Button>
      </Box>

      <ActivityMenus
        activities={activities}
        menuActivityId={menuActivityId}
        menuAnchorEl={menuAnchorEl}
        submenuAnchorEl={submenuAnchorEl}
        openSubmenu={openSubmenu}
        onCloseMenus={closeMenus}
        onOpenSubmenu={handleOpenSubmenu}
        onCloseSubmenu={() => { setSubmenuAnchorEl(null); setOpenSubmenu(null); }}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
        onEdit={handleEdit}
      />

      <ActivityFormDialog
        open={formOpen}
        activity={editActivity}
        onClose={() => { setFormOpen(false); }}
      />
    </>
  );
}
