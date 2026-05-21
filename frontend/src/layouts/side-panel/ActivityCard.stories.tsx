import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { Activity, ActivityStatus } from '@/types/activity';
import { formatDeadlineLabel } from '@/utils/activity-grouping';
import { MOCK_ACTIVITIES } from '@/storybook/mock-activities';
import { ActivityCard } from './ActivityCard';
import { statusMeta, typeLabelMap } from './constants';

const MOCK_ACTIVITY: Activity =
  MOCK_ACTIVITIES.find((activity) => activity.status === 'open') ?? MOCK_ACTIVITIES[0];

const meta: Meta<typeof ActivityCard> = {
  title: 'SidePanel/ActivityCard',
  component: ActivityCard,
  args: {
    activity: MOCK_ACTIVITY,
    deadlineLabel: formatDeadlineLabel(MOCK_ACTIVITY.deadline),
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

function activityWithStatus(status: ActivityStatus): Activity {
  return { ...MOCK_ACTIVITY, id: `activity-${status}`, status };
}

function statusArgs(status: ActivityStatus) {
  const activity = activityWithStatus(status);
  return {
    activity,
    deadlineLabel: formatDeadlineLabel(activity.deadline),
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
