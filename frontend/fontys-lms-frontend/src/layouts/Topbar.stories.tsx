import type { Meta, StoryObj } from '@storybook/react-vite'
import { LayoutStoryProvider } from '@/storybook/LayoutStoryProvider'
import { Topbar } from './Topbar'

const meta: Meta<typeof Topbar> = {
  title: 'Layouts/Topbar',
  component: Topbar,
}

export default meta
type Story = StoryObj<typeof Topbar>

export const Default: Story = {
  render: () => (
    <LayoutStoryProvider>
      <Topbar />
    </LayoutStoryProvider>
  ),
}

export const SidebarClosed: Story = {
  render: () => (
    <LayoutStoryProvider sidebarOpen={false}>
      <Topbar />
    </LayoutStoryProvider>
  ),
}

export const ActivitiesTab: Story = {
  render: () => (
    <LayoutStoryProvider activeTab="activities" sidePanelOpen>
      <Topbar />
    </LayoutStoryProvider>
  ),
}
