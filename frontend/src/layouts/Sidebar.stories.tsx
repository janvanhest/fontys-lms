import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LayoutStoryProvider } from '@/storybook/LayoutStoryProvider'
import { Sidebar } from './Sidebar'

const meta: Meta<typeof Sidebar> = {
  title: 'Layouts/Sidebar',
  component: Sidebar,
}

export default meta
type Story = StoryObj<typeof Sidebar>

function SidebarFrame({
  sidebarOpen,
}: {
  sidebarOpen: boolean
}) {
  return (
    <LayoutStoryProvider sidebarOpen={sidebarOpen}>
      <Box sx={{ height: 520, display: 'flex', bgcolor: 'background.default' }}>
        <Sidebar />
      </Box>
    </LayoutStoryProvider>
  )
}

export const Open: Story = {
  render: () => <SidebarFrame sidebarOpen />,
}

export const Closed: Story = {
  render: () => <SidebarFrame sidebarOpen={false} />,
}
