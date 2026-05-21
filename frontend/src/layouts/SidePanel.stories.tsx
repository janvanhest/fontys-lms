import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { activitiesQueryOptions } from '@/api/activities';
import { LayoutStoryProvider } from '@/storybook/LayoutStoryProvider';
import { MOCK_ACTIVITIES } from '@/storybook/mock-activities';
import { SidePanel } from './SidePanel';

function makeSidePanelClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(activitiesQueryOptions.queryKey, MOCK_ACTIVITIES);
  return client;
}

function SidePanelFrame({ sidePanelOpen }: { sidePanelOpen: boolean }) {
  return (
    <LayoutStoryProvider
      activeTab={sidePanelOpen ? 'activities' : 'chat'}
      sidePanelOpen={sidePanelOpen}
      sidePanelContent={sidePanelOpen ? { type: 'activities' } : null}
    >
      <QueryClientProvider client={makeSidePanelClient()}>
        <Box
          sx={{
            height: 720,
            display: 'flex',
            justifyContent: 'flex-end',
            bgcolor: 'background.default',
          }}
        >
          <SidePanel />
        </Box>
      </QueryClientProvider>
    </LayoutStoryProvider>
  );
}

const meta: Meta<typeof SidePanel> = {
  title: 'Layouts/SidePanel',
  component: SidePanel,
};

export default meta;
type Story = StoryObj<typeof SidePanel>;

export const Default: Story = {
  render: () => <SidePanelFrame sidePanelOpen />,
};

export const Collapsed: Story = {
  render: () => <SidePanelFrame sidePanelOpen={false} />,
};
