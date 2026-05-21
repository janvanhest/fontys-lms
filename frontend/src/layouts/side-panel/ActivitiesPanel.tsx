import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { useQuery } from '@tanstack/react-query';
import { activitiesQueryOptions, useUpdateActivity } from '@/api/activities';
import { ActivityDetails } from './ActivityDetails';
import { ActivityFormDialog } from './ActivityFormDialog';
import { ActivityMenus } from './ActivityMenus';
import { ActivitiesPanelContent } from './ActivitiesPanelContent';
import { ActivitiesPanelHeader } from './ActivitiesPanelHeader';
import { useActivitiesPanelState } from './useActivitiesPanelState';

export function ActivitiesPanel() {
  const {
    data: activities = [],
    isLoading,
    isError,
    error,
  } = useQuery(activitiesQueryOptions);

  const updateActivity = useUpdateActivity();
  const {
    closeMenus,
    editActivity,
    formOpen,
    groupedActivities,
    handleCardKeyDown,
    handleCreate,
    handleEdit,
    handleOpenMenu,
    handleOpenSubmenu,
    handleStatusChange,
    handleTypeChange,
    menuActivityId,
    menuAnchorEl,
    openSubmenu,
    selectedActivity,
    selectedActivityId,
    setFormOpen,
    setOpenSubmenu,
    setSelectedActivityId,
    setSubmenuAnchorEl,
    submenuAnchorEl,
  } = useActivitiesPanelState({
    activities,
    onUpdateActivity: (activityId, patch) => {
      updateActivity.mutate({ id: activityId, ...patch });
    },
  });

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
          onSelectActivity={setSelectedActivityId}
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
          onClick={handleCreate}
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
        key={editActivity?.id ?? 'new'}
        open={formOpen}
        activity={editActivity}
        onClose={() => { setFormOpen(false); }}
      />
    </>
  );
}
