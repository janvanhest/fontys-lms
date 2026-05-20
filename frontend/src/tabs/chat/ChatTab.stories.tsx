import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { studentProfileOptions, type StudentProfile } from '@/api/student';
import { LayoutStoryProvider } from '@/storybook/LayoutStoryProvider';
import { ChatTab } from './ChatTab';

const meta: Meta<typeof ChatTab> = {
  title: 'Tabs/ChatTab',
  component: ChatTab,
};

export default meta;
type Story = StoryObj<typeof ChatTab>;

const MOCK_STUDENT: StudentProfile = {
  id: 'student-1',
  canvasUserId: '31474',
  displayName: 'Hest, Jan J.H. van',
  email: 'jan.vanhest@student.fontys.nl',
  avatarUrl: 'https://avatars.githubusercontent.com/u/81753593?v=4',
  createdAt: '2026-05-19T00:00:00.000Z',
};

function ChatFrame({
  sidePanelOpen = false,
  children,
}: {
  sidePanelOpen?: boolean;
  children: ReactNode;
}) {
  const queryClient = new QueryClient();
  queryClient.setQueryData(studentProfileOptions.queryKey, MOCK_STUDENT);

  return (
    <QueryClientProvider client={queryClient}>
      <LayoutStoryProvider
        sidePanelOpen={sidePanelOpen}
        sidePanelContent={sidePanelOpen ? { type: 'activities' } : null}
      >
        <Box sx={{ height: 640, display: 'flex', flexDirection: 'column' }}>{children}</Box>
      </LayoutStoryProvider>
    </QueryClientProvider>
  );
}

export const Default: Story = {
  render: () => (
    <ChatFrame>
      <ChatTab />
    </ChatFrame>
  ),
};

export const SidePanelOpen: Story = {
  render: () => (
    <ChatFrame sidePanelOpen>
      <ChatTab />
    </ChatFrame>
  ),
};
