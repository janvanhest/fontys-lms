import { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';

import wireframeTheme from './themes/wireframeTheme';
import muiTheme from './themes/muiTheme';
import { INITIAL_MESSAGES, INITIAL_HISTORY, STATIC_RESPONSE } from './constants';

import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ActivitiesPanel from './components/ActivitiesPanel';
import LearningPanel from './components/LearningPanel';

const THEMES = { wireframe: wireframeTheme, mui: muiTheme };

let msgCounter = INITIAL_MESSAGES.length + 1;
const nextMsgId = () => `msg-${msgCounter++}`;

export default function App() {
  const [themeMode, setThemeMode]   = useState('wireframe');
  const [activeTab, setActiveTab]   = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages]     = useState(INITIAL_MESSAGES);
  const [activeChat, setActiveChat] = useState(INITIAL_HISTORY[0].id);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'activities') setSidebarOpen(false);
  };

  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleToggleTheme = () =>
    setThemeMode((prev) => (prev === 'wireframe' ? 'mui' : 'wireframe'));

  const handleSendMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      { id: nextMsgId(), role: 'user',      text },
      { id: nextMsgId(), role: 'assistant', text: STATIC_RESPONSE },
    ]);
  };

  return (
    <ThemeProvider theme={THEMES[themeMode]}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
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
          {activeTab === 'learning' ? (
            <LearningPanel />
          ) : (
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          )}
          <ActivitiesPanel open={activeTab === 'activities'} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
