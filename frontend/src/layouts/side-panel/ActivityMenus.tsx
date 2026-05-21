import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { statusMeta, statusOptions, subtypeOptions } from './constants';
import type { ActivityStatus, ActivityType, OpenSubmenu } from './types';
import type { Activity } from '@/types/activity';

type ActivityMenusProps = {
  activities: Activity[];
  menuActivityId: string | null;
  menuAnchorEl: HTMLElement | null;
  submenuAnchorEl: HTMLElement | null;
  openSubmenu: OpenSubmenu;
  onCloseMenus: () => void;
  onOpenSubmenu: (event: React.MouseEvent<HTMLElement>, submenu: 'type' | 'status') => void;
  onCloseSubmenu: () => void;
  onTypeChange: (nextType: ActivityType) => void;
  onStatusChange: (status: ActivityStatus) => void;
  onEdit: (activity: Activity) => void;
};

export function ActivityMenus({
  activities,
  menuActivityId,
  menuAnchorEl,
  submenuAnchorEl,
  openSubmenu,
  onCloseMenus,
  onOpenSubmenu,
  onCloseSubmenu,
  onTypeChange,
  onStatusChange,
  onEdit,
}: ActivityMenusProps) {
  const activity = activities.find((item) => item.id === menuActivityId);

  return (
    <>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={onCloseMenus}
        slotProps={{
          list: {
            'aria-label': 'Activiteitenkaart acties',
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (activity) onEdit(activity);
            onCloseMenus();
          }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Bewerken</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={(event) => {
            onOpenSubmenu(event, 'type');
          }}
        >
          <ListItemIcon>
            <CategoryOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Verander soort</ListItemText>
          <ChevronRightIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={(event) => {
            onOpenSubmenu(event, 'status');
          }}
        >
          <ListItemIcon>
            <FlagOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Markeer als...</ListItemText>
          <ChevronRightIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={submenuAnchorEl}
        open={Boolean(submenuAnchorEl && openSubmenu)}
        onClose={onCloseSubmenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {openSubmenu === 'type'
          ? subtypeOptions.map((option) => (
              <MenuItem
                key={option.value}
                onClick={() => {
                  onTypeChange(option.value);
                }}
              >
                <ListItemText>{option.label}</ListItemText>
              </MenuItem>
            ))
          : null}

        {openSubmenu === 'status'
          ? statusOptions.map((status) => (
              <MenuItem
                key={status}
                selected={activity?.status === status}
                onClick={() => {
                  onStatusChange(status);
                }}
              >
                <ListItemIcon>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: statusMeta[status].color,
                    }}
                  />
                </ListItemIcon>
                <ListItemText>{statusMeta[status].label}</ListItemText>
              </MenuItem>
            ))
          : null}
      </Menu>
    </>
  );
}
