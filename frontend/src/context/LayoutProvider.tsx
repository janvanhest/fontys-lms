import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import {
  LayoutContext,
  type LayoutContextValue,
  type LayoutTab,
  type SidePanelContent,
} from '@/context/layout-context';
import { useHighlightActivity } from '@/hooks/useHighlightActivity';

export function LayoutProvider({ children }: PropsWithChildren) {
  const [activeTab, setActiveTab] = useState<LayoutTab>('chat');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [chatMountKey, setChatMountKey] = useState<string>('init');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [sidePanelContent, setSidePanelContent] = useState<SidePanelContent | null>(null);
  const { highlightedActivityId, highlightActivity } = useHighlightActivity();

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

  const closeSidePanel = useCallback(() => {
    setSidePanelOpen(false);
  }, []);

  const value = useMemo<LayoutContextValue>(
    () => ({
      activeTab,
      selectTab,
      selectedConversationId,
      setSelectedConversationId,
      chatMountKey,
      setChatMountKey,
      sidebarOpen,
      setSidebarOpen,
      sidePanelOpen,
      setSidePanelOpen,
      sidePanelContent,
      openSidePanel,
      closeSidePanel,
      highlightedActivityId,
      highlightActivity,
    }),
    [
      activeTab,
      selectTab,
      selectedConversationId,
      chatMountKey,
      sidebarOpen,
      sidePanelOpen,
      sidePanelContent,
      openSidePanel,
      closeSidePanel,
      highlightedActivityId,
      highlightActivity,
    ],
  );

  return <LayoutContext value={value}>{children}</LayoutContext>;
}
