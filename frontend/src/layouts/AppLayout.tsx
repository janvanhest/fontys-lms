import Box from '@mui/material/Box';
import { useLayout } from '@/context/useLayout';
import { ChatTab } from '@/tabs/chat/ChatTab';
import { ChallengeTab } from '@/tabs/ChallengeTab';
import { CompetentiesTab } from '@/tabs/CompetentiesTab';
import { StappenplanTab } from '@/tabs/StappenplanTab';
import { Sidebar } from './sidebar/Sidebar';
import { SidePanel } from './SidePanel';
import { Topbar } from '@/layouts/topbar/Topbar';

function assertUnreachable(tab: never): never {
  throw new Error(`Unexpected activeTab value: ${String(tab)}`);
}

export function AppLayout() {
  const { activeTab, selectedConversationId, chatMountKey } = useLayout();
  const isChat = activeTab === 'chat' || activeTab === 'activities';

  function renderTab() {
    switch (activeTab) {
      case 'chat':
      case 'activities':
        return <ChatTab key={chatMountKey} conversationId={selectedConversationId ?? undefined} />;
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
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            // ChatTab beheert zijn eigen scroll intern; andere tabs scrollen op paginaniveau
            overflow: isChat ? 'hidden' : 'auto',
          }}
        >
          {renderTab()}
        </Box>
        <SidePanel />
      </Box>
    </Box>
  );
}
