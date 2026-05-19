import { useState } from 'react';
import type { Theme } from '@mui/material/styles';
import { CssBaseline, ThemeProvider } from '@mui/material';
import Box from '@mui/material/Box';

import { INITIAL_HISTORY, INITIAL_MESSAGES, STATIC_RESPONSE } from './constants';
import type { AppTab, Message, ThemeMode } from './types';
import ActivitiesPanel from './components/ActivitiesPanel';
import ChatWindow from './components/ChatWindow';
import ChallengePanel from './components/ChallengePanel';
import CompetenciesPanel from './components/CompetenciesPanel';
import Sidebar from './components/Sidebar';
import StudyPlanPanel from './components/StudyPlanPanel';
import TopBar from './components/TopBar';
import muiTheme from './themes/muiTheme';
import wireframeTheme from './themes/wireframeTheme';

const THEMES: Record<ThemeMode, Theme> = {
  wireframe: wireframeTheme,
  mui: muiTheme,
};

let msgCounter = INITIAL_MESSAGES.length + 1;

function nextMsgId(): string {
  return `msg-${msgCounter++}`;
}

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('wireframe');
  const [activeTab, setActiveTab] = useState<AppTab>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [activeChat, setActiveChat] = useState(INITIAL_HISTORY[0]?.id ?? '');

  const handleTabChange = (tab: AppTab) => {
    setActiveTab(tab);
    if (tab !== 'chat') {
      setSidebarOpen(false);
    }
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'wireframe' ? 'mui' : 'wireframe'));
  };

  const handleSendMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: nextMsgId(), role: 'user', text },
      { id: nextMsgId(), role: 'assistant', text: STATIC_RESPONSE },
    ]);
  };

  return (
    <ThemeProvider theme={THEMES[themeMode]}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <TopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
        />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar
            open={sidebarOpen}
            onNewChat={() => {}}
            history={INITIAL_HISTORY}
            activeChat={activeChat}
            onSelectChat={setActiveChat}
          />
          {activeTab === 'chat' || activeTab === 'activities' ? (
            <ChatWindow messages={messages} onSendMessage={handleSendMessage} />
          ) : activeTab === 'challenge' ? (
            <ChallengePanel />
          ) : activeTab === 'study-plan' ? (
            <StudyPlanPanel />
          ) : (
            <CompetenciesPanel />
          )}
          <ActivitiesPanel open={activeTab === 'activities'} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
