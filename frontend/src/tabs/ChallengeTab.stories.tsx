import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChallengeTab } from './ChallengeTab';

const meta: Meta<typeof ChallengeTab> = {
  title: 'Tabs/ChallengeTab',
  component: ChallengeTab,
};

export default meta;
type Story = StoryObj<typeof ChallengeTab>;

export const Default: Story = {};
