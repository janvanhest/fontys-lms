import Box from '@mui/material/Box'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, type PropsWithChildren } from 'react'
import { LayoutStoryProvider } from '@/storybook/LayoutStoryProvider'
import { Sidebar } from './Sidebar'

const meta: Meta<typeof Sidebar> = {
  title: 'Layouts/Sidebar',
  component: Sidebar,
}

export default meta
type Story = StoryObj<typeof Sidebar>

const conversations = [
  {
    id: 'conversation-1',
    studentId: 'student-1',
    createdAt: '2026-05-19T00:24:00.000Z',
    title: 'Semesterplan hulp',
  },
  {
    id: 'conversation-2',
    studentId: 'student-1',
    createdAt: '2026-05-19T00:23:00.000Z',
    title: 'Portflow uitleg',
  },
]

function MockSidebarFetch({ children }: PropsWithChildren) {
  const originalFetch = globalThis.fetch

  globalThis.fetch = async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    if (url.endsWith('/chat/conversations')) {
      return new Response(JSON.stringify(conversations), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (url.endsWith('/chat/conversations/conversation-1') || url.endsWith('/chat/conversations/conversation-2')) {
      return new Response(JSON.stringify({ id: 'conversation-1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (url.includes('/chat/conversations/') && url.includes('conversation-')) {
      return new Response(JSON.stringify({ id: 'conversation-1', title: 'Semesterplan hulp' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    throw new Error(`Unhandled fetch in story: ${url}`)
  }

  useEffect(() => {
    return () => {
      globalThis.fetch = originalFetch
    }
  }, [originalFetch])

  return <>{children}</>
}

function SidebarFrame({
  sidebarOpen,
}: {
  sidebarOpen: boolean
}) {
  return (
    <MockSidebarFetch>
      <LayoutStoryProvider sidebarOpen={sidebarOpen}>
        <Box sx={{ height: 520, display: 'flex', bgcolor: 'background.default' }}>
          <Sidebar />
        </Box>
      </LayoutStoryProvider>
    </MockSidebarFetch>
  )
}

export const Open: Story = {
  render: () => <SidebarFrame sidebarOpen />,
}

export const Closed: Story = {
  render: () => <SidebarFrame sidebarOpen={false} />,
}
