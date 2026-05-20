import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import {
  LayoutContext,
  type LayoutContextValue,
  type LayoutTab,
  type SidePanelContent,
} from '@/context/layout-context';

export function LayoutProvider({ children }: PropsWithChildren) {
  const [activeTab, setActiveTab] = useState<LayoutTab>('chat');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [sidePanelContent, setSidePanelContent] = useState<SidePanelContent | null>(null);

  const selectTab = useCallback((tab: LayoutTab) => {
    setActiveTab(tab);

    if (tab === 'activities') {
      setSidePanelOpen(true);
      setSidePanelContent({ type: 'activities' });
      return;
    }

    if (tab !== 'chat') {
      setSidePanelOpen(false);
    }
  }, []);

  const openSidePanel = useCallback((content: SidePanelContent) => {
    setSidePanelContent(content);
    setSidePanelOpen(true);
  }, []);

  const value = useMemo<LayoutContextValue>(
    () => ({
      activeTab,
      selectTab,
      selectedConversationId,
      setSelectedConversationId,
      sidebarOpen,
      setSidebarOpen,
      sidePanelOpen,
      setSidePanelOpen,
      sidePanelContent,
      openSidePanel,
    }),
    [activeTab, selectTab, selectedConversationId, sidebarOpen, sidePanelOpen, sidePanelContent, openSidePanel],
  );

  return <LayoutContext value={value}>{children}</LayoutContext>;
}
