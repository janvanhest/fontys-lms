import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { statusMeta, statusOptions, subtypeOptions } from './constants';
import type { ActivityItem, ActivityStatus, ActivityType, OpenSubmenu } from './types';

type ActivityMenusProps = {
  activities: ActivityItem[];
  menuActivityId: string | null;
  menuAnchorEl: HTMLElement | null;
  submenuAnchorEl: HTMLElement | null;
  openSubmenu: OpenSubmenu;
  onCloseMenus: () => void;
  onOpenSubmenu: (event: React.MouseEvent<HTMLElement>, submenu: 'type' | 'status') => void;
  onCloseSubmenu: () => void;
  onTypeChange: (nextType: ActivityType) => void;
  onStatusChange: (status: ActivityStatus) => void;
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
        <MenuItem onClick={onCloseMenus}>Hernoem titel</MenuItem>
        <MenuItem onClick={onCloseMenus}>Bewerk</MenuItem>
        <MenuItem
          onClick={(event) => {
            onOpenSubmenu(event, 'type');
          }}
        >
          <SubmenuLabel label="Verander soort" />
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={(event) => {
            onOpenSubmenu(event, 'status');
          }}
        >
          <SubmenuLabel label="Markeer als..." />
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
                {option.label}
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
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    mr: 1.25,
                    borderRadius: '50%',
                    bgcolor: statusMeta[status].color,
                    flexShrink: 0,
                  }}
                />
                {statusMeta[status].label}
              </MenuItem>
            ))
          : null}
      </Menu>
    </>
  );
}

function SubmenuLabel({ label }: { label: string }) {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
      }}
    >
      <Typography variant="inherit">{label}</Typography>
      <ChevronRightIcon fontSize="small" />
    </Box>
  );
}
