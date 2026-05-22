import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import type { Activity } from '@/types/activity';
import { MOCK_ACTIVITIES } from '@/storybook/mock-activities';
import { ActivityDetails } from './ActivityDetails';

const DEFAULT_ACTIVITY: Activity =
  MOCK_ACTIVITIES.find((activity) => activity.type === 'opdracht') ?? MOCK_ACTIVITIES[0];

const WORKSHOP_ACTIVITY: Activity = MOCK_ACTIVITIES.find(
  (activity) => activity.type === 'workshop',
) ?? {
  ...DEFAULT_ACTIVITY,
  id: 'workshop-story',
  type: 'workshop',
  title: 'Workshop ontwerpkeuzes',
  description: 'Werk de ontwerpkeuzes uit en bespreek deze met je coach.',
};

const DONE_ACTIVITY: Activity = MOCK_ACTIVITIES.find(
  (activity) => activity.status === 'afgerond',
) ?? {
  ...DEFAULT_ACTIVITY,
  id: 'done-story',
  status: 'afgerond',
};

const LONG_DESCRIPTION_ACTIVITY: Activity = {
  ...DEFAULT_ACTIVITY,
  id: 'long-description-story',
  title: 'Onderbouw je vervolgstappen',
  description:
    'Beschrijf welke feedback je hebt ontvangen, welke keuzes je daardoor hebt gemaakt en hoe deze keuzes zichtbaar worden in je volgende iteratie. Neem ook mee welke competenties hiermee worden geraakt en welke concrete bewijslast je daarvoor wilt verzamelen.',
};

const meta: Meta<typeof ActivityDetails> = {
  title: 'SidePanel/ActivityDetails',
  component: ActivityDetails,
  args: {
    activity: DEFAULT_ACTIVITY,
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ActivityDetails>;

export const Default: Story = {};

export const Workshop: Story = {
  args: {
    activity: WORKSHOP_ACTIVITY,
  },
};

export const Afgerond: Story = {
  args: {
    activity: DONE_ACTIVITY,
  },
};

export const LangeBeschrijving: Story = {
  args: {
    activity: LONG_DESCRIPTION_ACTIVITY,
  },
};
