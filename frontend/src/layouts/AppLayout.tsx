import Box from '@mui/material/Box';
import { useLayout } from '@/context/useLayout';
import { ChatTab } from '@/tabs/chat/ChatTab';
import { ChallengeTab } from '@/tabs/ChallengeTab';
import { CompetentiesTab } from '@/tabs/CompetentiesTab';
import { StappenplanTab } from '@/tabs/StappenplanTab';
import { Sidebar } from './Sidebar';
import { SidePanel } from './SidePanel';
import { Topbar } from '@/layouts/topbar/Topbar';

function assertUnreachable(tab: never): never {
  throw new Error(`Unexpected activeTab value: ${String(tab)}`);
}

function renderActiveTab(activeTab: ReturnType<typeof useLayout>['activeTab']) {
  switch (activeTab) {
    case 'chat':
    case 'activities':
      return <ChatTab />;
    case 'challenge':
      return <ChallengeTab />;
    case 'competenties':
      return <CompetentiesTab />;
    case 'stappenplan':
      return <StappenplanTab />;
    default:
      return assertUnreachable(activeTab);
  }
}

export function AppLayout() {
  const { activeTab, selectedConversationId } = useLayout();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        bgcolor: 'background.default',
      }}
    >
      <Topbar />

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Sidebar />
        <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          {activeTab === 'chat' || activeTab === 'activities' ? (
            <ChatTab
              key={selectedConversationId ?? 'new-conversation'}
              conversationId={selectedConversationId ?? undefined}
            />
          ) : (
            renderActiveTab(activeTab)
          )}
        </Box>
        <SidePanel />
      </Box>
    </Box>
  );
}
