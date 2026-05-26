import { useMemo, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { groupActivities } from '@/utils/activity-grouping';
import type { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import type { ActivityGroupSection, OpenSubmenu } from './types';

type UseActivitiesPanelStateOptions = {
  activities: Activity[];
  onUpdateActivity: (
    activityId: string,
    patch: { status?: ActivityStatus; type?: ActivityType },
  ) => void;
};

export function useActivitiesPanelState({
  activities,
  onUpdateActivity,
}: UseActivitiesPanelStateOptions) {
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
  const selectedActivity =
    activities.find((activity) => activity.id === selectedActivityId) ?? null;

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
    onUpdateActivity(menuActivityId, { status });
    closeMenus();
  };

  const handleTypeChange = (nextType: ActivityType) => {
    if (!menuActivityId) return;
    onUpdateActivity(menuActivityId, { type: nextType });
    closeMenus();
  };

  const handleEdit = (activity: Activity) => {
    setEditActivity(activity);
    setFormOpen(true);
    closeMenus();
  };

  const handleCreate = () => {
    setEditActivity(null);
    setFormOpen(true);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, activityId: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if ((event.target as HTMLElement).closest('button,[role="button"]')) return;
    event.preventDefault();
    setSelectedActivityId(activityId);
  };

  return {
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
  };
}
