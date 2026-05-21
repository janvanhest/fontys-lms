import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { LayoutStoryProvider } from '@/storybook/LayoutStoryProvider';
import { initialActivities } from './side-panel/constants';
import { SidePanel } from './SidePanel';

const SELECTED_ACTIVITY_ID =
  initialActivities.find((activity) => activity.status === 'open')?.id ?? initialActivities[0].id;

const meta: Meta<typeof SidePanel> = {
  title: 'Layouts/SidePanel',
  component: SidePanel,
  args: {
    initialActivityItems: initialActivities,
    initialSelectedActivityId: null,
  },
};

export default meta;
type Story = StoryObj<typeof SidePanel>;

function SidePanelFrame({
  sidePanelOpen,
  children,
}: {
  sidePanelOpen: boolean;
  children: ReactNode;
}) {
  return (
    <LayoutStoryProvider
      activeTab={sidePanelOpen ? 'activities' : 'chat'}
      sidePanelOpen={sidePanelOpen}
    >
      <Box
        sx={{
          height: 720,
          display: 'flex',
          justifyContent: 'flex-end',
          bgcolor: 'background.default',
        }}
      >
        {children}
      </Box>
    </LayoutStoryProvider>
  );
}

export const Default: Story = {
  render: (args) => (
    <SidePanelFrame sidePanelOpen>
      <SidePanel {...args} />
    </SidePanelFrame>
  ),
};

export const WithSelectedActivity: Story = {
  args: {
    initialSelectedActivityId: SELECTED_ACTIVITY_ID,
  },
  render: (args) => (
    <SidePanelFrame sidePanelOpen>
      <SidePanel {...args} />
    </SidePanelFrame>
  ),
};

export const Collapsed: Story = {
  render: (args) => (
    <SidePanelFrame sidePanelOpen={false}>
      <SidePanel {...args} />
    </SidePanelFrame>
  ),
};
