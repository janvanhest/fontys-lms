import type { Meta, StoryObj } from '@storybook/react-vite';
import { CompetentiesTab } from './CompetentiesTab';

const meta: Meta<typeof CompetentiesTab> = {
  title: 'Tabs/CompetentiesTab',
  component: CompetentiesTab,
};

export default meta;
type Story = StoryObj<typeof CompetentiesTab>;

export const Default: Story = {};
