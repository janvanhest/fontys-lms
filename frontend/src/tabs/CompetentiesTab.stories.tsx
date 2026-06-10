import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CompetentiesTab } from './CompetentiesTab';

const meta: Meta<typeof CompetentiesTab> = {
  title: 'Tabs/CompetentiesTab',
  component: CompetentiesTab,
};

export default meta;
type Story = StoryObj<typeof CompetentiesTab>;

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

export const Default: Story = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};
