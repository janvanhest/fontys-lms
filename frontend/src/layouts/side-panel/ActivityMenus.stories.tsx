import { useState, type ComponentProps, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { MOCK_ACTIVITIES } from '@/storybook/mock-activities';
import { ActivityMenus } from './ActivityMenus';
import type { OpenSubmenu } from './types';

const MENU_ACTIVITY_ID = MOCK_ACTIVITIES[0].id;

const meta: Meta<typeof ActivityMenus> = {
  title: 'SidePanel/ActivityMenus',
  component: ActivityMenus,
  args: {
    activities: MOCK_ACTIVITIES,
    menuActivityId: MENU_ACTIVITY_ID,
    menuAnchorEl: null,
    submenuAnchorEl: null,
    openSubmenu: null,
    onCloseMenus: fn(),
    onOpenSubmenu: fn(),
    onCloseSubmenu: fn(),
    onTypeChange: fn(),
    onStatusChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ActivityMenus>;

function MenuStory({
  initialOpenSubmenu,
  args,
}: {
  initialOpenSubmenu: OpenSubmenu;
  args: ComponentProps<typeof ActivityMenus>;
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<OpenSubmenu>(initialOpenSubmenu);

  const closeMenus = () => {
    setMenuAnchorEl(null);
    setSubmenuAnchorEl(null);
    setOpenSubmenu(null);
    args.onCloseMenus();
  };

  const openSubmenuMenu = (event: MouseEvent<HTMLElement>, submenu: Exclude<OpenSubmenu, null>) => {
    setSubmenuAnchorEl(event.currentTarget as HTMLButtonElement);
    setOpenSubmenu(submenu);
    args.onOpenSubmenu(event, submenu);
  };

  return (
    <Box sx={{ height: 360, p: 4 }}>
      <Stack direction="row" spacing={2}>
        <Button
          ref={setMenuAnchorEl}
          variant="contained"
          onClick={(event) => {
            setMenuAnchorEl(event.currentTarget);
          }}
        >
          Main menu anchor
        </Button>
        <Button
          ref={setSubmenuAnchorEl}
          variant="outlined"
          onClick={(event) => {
            setSubmenuAnchorEl(event.currentTarget);
          }}
        >
          Submenu anchor
        </Button>
      </Stack>

      <ActivityMenus
        {...args}
        menuAnchorEl={menuAnchorEl}
        submenuAnchorEl={submenuAnchorEl}
        openSubmenu={openSubmenu}
        onCloseMenus={closeMenus}
        onOpenSubmenu={openSubmenuMenu}
        onCloseSubmenu={() => {
          setOpenSubmenu(null);
          args.onCloseSubmenu();
        }}
      />
    </Box>
  );
}

export const MainMenuOpen: Story = {
  render: (args) => <MenuStory args={args} initialOpenSubmenu={null} />,
};

export const TypeSubmenuOpen: Story = {
  render: (args) => <MenuStory args={args} initialOpenSubmenu="type" />,
};

export const StatusSubmenuOpen: Story = {
  render: (args) => <MenuStory args={args} initialOpenSubmenu="status" />,
};
