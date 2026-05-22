import { createContext } from 'react';

export type LayoutTab = 'chat' | 'activities' | 'challenge' | 'competenties' | 'stappenplan';

export type SidePanelContent = { type: 'activities' };

export type LayoutContextValue = {
  activeTab: LayoutTab;
  selectTab: (tab: LayoutTab) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (conversationId: string | null) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidePanelOpen: boolean;
  setSidePanelOpen: (open: boolean) => void;
  sidePanelContent: SidePanelContent | null;
  openSidePanel: (content: SidePanelContent) => void;
  highlightedActivityId: string | null;
  highlightActivity: (id: string) => void;
};

export const LayoutContext = createContext<LayoutContextValue | null>(null);
