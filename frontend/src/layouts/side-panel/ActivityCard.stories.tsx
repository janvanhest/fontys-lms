import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ActivityCard } from './ActivityCard';
import { initialActivities, statusMeta, typeLabelMap } from './constants';
import type { ActivityItem, ActivityStatus } from './types';

const MOCK_ACTIVITY: ActivityItem =
  initialActivities.find((activity) => activity.status === 'open') ?? initialActivities[0];

const meta: Meta<typeof ActivityCard> = {
  title: 'SidePanel/ActivityCard',
  component: ActivityCard,
  args: {
    activity: MOCK_ACTIVITY,
    isSelected: false,
    menuOpen: false,
    statusColor: statusMeta[MOCK_ACTIVITY.status].color,
    statusLabel: statusMeta[MOCK_ACTIVITY.status].label,
    typeLabel: typeLabelMap[MOCK_ACTIVITY.type],
    onSelect: fn(),
    onKeyDown: fn(),
    onOpenMenu: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ActivityCard>;

function activityWithStatus(status: ActivityStatus): ActivityItem {
  return {
    ...MOCK_ACTIVITY,
    id: `activity-${status}`,
    status,
  };
}

function statusArgs(status: ActivityStatus) {
  const activity = activityWithStatus(status);

  return {
    activity,
    statusColor: statusMeta[status].color,
    statusLabel: statusMeta[status].label,
    typeLabel: typeLabelMap[activity.type],
  };
}

export const Default: Story = {};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
};

export const MenuOpen: Story = {
  args: {
    menuOpen: true,
  },
};

export const StatusBezig: Story = {
  args: statusArgs('bezig'),
};

export const StatusFeedback: Story = {
  args: statusArgs('feedback'),
};

export const StatusAfgerond: Story = {
  args: statusArgs('afgerond'),
};
