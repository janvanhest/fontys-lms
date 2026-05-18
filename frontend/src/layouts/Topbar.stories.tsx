import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { StudentProfile } from '@/api/student'
import { studentProfileOptions } from '@/api/student'
import { LayoutStoryProvider } from '@/storybook/LayoutStoryProvider'
import { Topbar } from './Topbar'

const meta: Meta<typeof Topbar> = {
  title: 'Layouts/Topbar',
  component: Topbar,
}
export default meta
type Story = StoryObj<typeof Topbar>

const mockStudent: StudentProfile = {
  id: 'uuid-1',
  canvasUserId: '31474',
  displayName: 'Hest, Jan J.H. van',
  email: 'jan.vanhest@student.fontys.nl',
  avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
  createdAt: '2026-05-18T00:00:00.000Z',
}

function withStudent(student?: StudentProfile) {
  const qc = new QueryClient()
  if (student) {
    qc.setQueryData(studentProfileOptions.queryKey, student)
  }
  return (Story: React.ComponentType) => (
    <QueryClientProvider client={qc}>
      <Story />
    </QueryClientProvider>
  )
}

export const WithProfile: Story = {
  decorators: [withStudent(mockStudent)],
  render: () => (
    <LayoutStoryProvider>
      <Topbar />
    </LayoutStoryProvider>
  ),
}

export const LoadingProfile: Story = {
  decorators: [withStudent(undefined)],
  render: () => (
    <LayoutStoryProvider>
      <Topbar />
    </LayoutStoryProvider>
  ),
}

export const Default: Story = {
  decorators: [withStudent(mockStudent)],
  render: () => (
    <LayoutStoryProvider>
      <Topbar />
    </LayoutStoryProvider>
  ),
}

export const SidebarClosed: Story = {
  decorators: [withStudent(mockStudent)],
  render: () => (
    <LayoutStoryProvider sidebarOpen={false}>
      <Topbar />
    </LayoutStoryProvider>
  ),
}

export const ActivitiesTab: Story = {
  decorators: [withStudent(mockStudent)],
  render: () => (
    <LayoutStoryProvider activeTab="activities" sidePanelOpen>
      <Topbar />
    </LayoutStoryProvider>
  ),
}
