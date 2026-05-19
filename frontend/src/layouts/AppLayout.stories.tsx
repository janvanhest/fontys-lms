import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { expect, waitFor } from 'storybook/test'
import type { StudentProfile } from '@/api/student'
import { LayoutStoryProvider } from '@/storybook/LayoutStoryProvider'
import { AppLayout } from './AppLayout'

const meta: Meta<typeof AppLayout> = {
  title: 'Layouts/AppLayout',
  component: AppLayout,
}

export default meta
type Story = StoryObj<typeof AppLayout>

const mockStudent: StudentProfile = {
  id: 'student-1',
  canvasUserId: '31474',
  displayName: 'Hest, Jan J.H. van',
  email: 'jan.vanhest@student.fontys.nl',
  avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
  createdAt: '2026-05-19T00:00:00.000Z',
}

const conversations = [
  {
    id: 'conversation-1',
    studentId: 'student-1',
    createdAt: '2026-05-19T10:15:00.000Z',
    title: 'Semesterplan hulp',
  },
]

const conversationDetails = {
  id: 'conversation-1',
  studentId: 'student-1',
  createdAt: '2026-05-19T10:15:00.000Z',
  title: 'Semesterplan hulp',
  messages: [
    {
      id: 'message-1',
      conversationId: 'conversation-1',
      role: 'student',
      content: 'Kun je mij helpen met mijn semesterplan?',
      timestamp: '2026-05-19T10:15:10.000Z',
    },
    {
      id: 'message-2',
      conversationId: 'conversation-1',
      role: 'assistant',
      content: 'Natuurlijk. Laten we beginnen met je doelen voor dit semester.',
      timestamp: '2026-05-19T10:15:20.000Z',
    },
  ],
}

function MockFetchBoundary({ children }: React.PropsWithChildren) {
  const originalFetch = globalThis.fetch

  globalThis.fetch = async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

    if (url.endsWith('/student/me')) {
      return new Response(JSON.stringify(mockStudent), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (url.endsWith('/chat/conversations')) {
      return new Response(JSON.stringify(conversations), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (url.endsWith('/chat/conversations/conversation-1')) {
      return new Response(JSON.stringify(conversationDetails), {
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

function withAppProviders() {
  const qc = new QueryClient()

  return (Story: React.ComponentType) => (
    <QueryClientProvider client={qc}>
      <MockFetchBoundary>
        <LayoutStoryProvider>
          <Story />
        </LayoutStoryProvider>
      </MockFetchBoundary>
    </QueryClientProvider>
  )
}

export const ConversationSelectionLoadsHistory: Story = {
  decorators: [withAppProviders()],
  render: () => <AppLayout />,
  play: async ({ canvas, userEvent }) => {
    const conversationButton = await canvas.findByRole('button', {
      name: /semesterplan hulp/i,
    })

    await userEvent.click(conversationButton)

    await waitFor(() =>
      expect(
        canvas.getByText('Kun je mij helpen met mijn semesterplan?'),
      ).toBeInTheDocument(),
    )
    await waitFor(() =>
      expect(
        canvas.getByText('Natuurlijk. Laten we beginnen met je doelen voor dit semester.'),
      ).toBeInTheDocument(),
    )
  },
}
