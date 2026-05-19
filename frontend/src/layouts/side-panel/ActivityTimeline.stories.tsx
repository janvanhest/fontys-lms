import { useState, type ComponentProps, type KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ActivityTimeline } from './ActivityTimeline';
import { groupMeta, groupOrder, initialActivities, panelWidth } from './constants';
import type { ActivityGroupSection, ActivityItem } from './types';

function buildGroups(activities: ActivityItem[] = initialActivities): ActivityGroupSection[] {
  return groupOrder
    .map((groupKey) => ({
      groupKey,
      ...groupMeta[groupKey],
      items: activities.filter((a) => a.groupKey === groupKey),
    }))
    .filter((group) => group.items.length > 0) as ActivityGroupSection[];
}

const ALL_GROUPS = buildGroups();

const meta: Meta<typeof ActivityTimeline> = {
  title: 'SidePanel/ActivityTimeline',
  component: ActivityTimeline,
  decorators: [
    (Story) => (
      <Box sx={{ width: panelWidth, px: 1.5, py: 1.5 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    groups: ALL_GROUPS,
    selectedActivityId: null,
    menuActivityId: null,
    menuAnchorEl: null,
    onSelectActivity: fn(),
    onCardKeyDown: fn(),
    onOpenMenu: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ActivityTimeline>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: {
    selectedActivityId: initialActivities[2].id,
  },
};

export const SingleGroup: Story = {
  args: {
    groups: buildGroups(initialActivities.filter((a) => a.groupKey === 'deze-week')),
  },
};

function InteractiveStory(args: ComponentProps<typeof ActivityTimeline>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <ActivityTimeline
      {...args}
      selectedActivityId={selectedId}
      onSelectActivity={(id) => {
        setSelectedId(id);
        args.onSelectActivity(id);
      }}
      onCardKeyDown={(event: KeyboardEvent<HTMLDivElement>, id: string) => {
        setSelectedId(id);
        args.onCardKeyDown(event, id);
      }}
    />
  );
}

export const Interactive: Story = {
  render: (args) => <InteractiveStory {...args} />,
};
