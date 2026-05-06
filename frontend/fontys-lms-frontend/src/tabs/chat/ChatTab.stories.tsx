import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { LayoutStoryProvider } from '@/storybook/LayoutStoryProvider'
import { ChatTab } from './ChatTab'
import { defaultMessages } from './chatMessages'

const meta: Meta<typeof ChatTab> = {
  title: 'Tabs/ChatTab',
  component: ChatTab,
  args: {
    messages: defaultMessages,
  },
}

export default meta
type Story = StoryObj<typeof ChatTab>

function ChatFrame({
  sidePanelOpen = false,
  children,
}: {
  sidePanelOpen?: boolean
  children: ReactNode
}) {
  return (
    <LayoutStoryProvider sidePanelOpen={sidePanelOpen}>
      <Box sx={{ height: 640, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </LayoutStoryProvider>
  )
}

export const Default: Story = {
  render: (args) => (
    <ChatFrame>
      <ChatTab {...args} />
    </ChatFrame>
  ),
}

export const EmptyConversation: Story = {
  args: {
    messages: [],
  },
  render: (args) => (
    <ChatFrame>
      <ChatTab {...args} />
    </ChatFrame>
  ),
}

export const SidePanelOpen: Story = {
  render: (args) => (
    <ChatFrame sidePanelOpen>
      <ChatTab {...args} />
    </ChatFrame>
  ),
}
