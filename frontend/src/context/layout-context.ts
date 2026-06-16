import { createContext } from 'react';

export const HIGHLIGHT_DURATION_MS = Number(import.meta.env.VITE_HIGHLIGHT_DURATION_MS) || 2000;

export type LayoutTab = 'chat' | 'activities' | 'challenge' | 'competenties' | 'stappenplan';

export type SidePanelContent = { type: 'activities' | 'competences' };

export type LayoutContextValue = {
  activeTab: LayoutTab;
  selectTab: (tab: LayoutTab) => void;
  selectedConversationId: string | null;
  setSelectedConversationId: (conversationId: string | null) => void;
  chatMountKey: string;
  setChatMountKey: (key: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidePanelOpen: boolean;
  setSidePanelOpen: (open: boolean) => void;
  sidePanelContent: SidePanelContent | null;
  openSidePanel: (content: SidePanelContent) => void;
  closeSidePanel: () => void;
  highlightedActivityId: string | null;
  highlightActivity: (id: string) => void;
  highlightedCompetenceKey: string | null;
  highlightCompetence: (key: string) => void;
};

export const LayoutContext = createContext<LayoutContextValue | null>(null);
