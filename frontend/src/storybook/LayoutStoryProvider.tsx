import { useCallback, useMemo, useState, type PropsWithChildren } from 'react';
import {
  LayoutContext,
  type LayoutContextValue,
  type LayoutTab,
  type SidePanelContent,
} from '@/context/layout-context';
import { useHighlightActivity } from '@/hooks/useHighlightActivity';

type LayoutStoryProviderProps = PropsWithChildren<{
  activeTab?: LayoutTab;
  sidebarOpen?: boolean;
  sidePanelOpen?: boolean;
  sidePanelContent?: SidePanelContent | null;
}>;

export function LayoutStoryProvider({
  activeTab: initialActiveTab = 'chat',
  sidebarOpen: initialSidebarOpen = true,
  sidePanelOpen: initialSidePanelOpen = false,
  sidePanelContent: initialSidePanelContent = null,
  children,
}: LayoutStoryProviderProps) {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [chatMountKey, setChatMountKey] = useState<string>('init');
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);
  const [sidePanelOpen, setSidePanelOpen] = useState(initialSidePanelOpen);
  const [sidePanelContent, setSidePanelContent] = useState<SidePanelContent | null>(
    initialSidePanelContent,
  );
  const { highlightedActivityId, highlightActivity } = useHighlightActivity();

  const selectTab = useCallback((tab: LayoutTab) => {
    setActiveTab(tab);
    if (tab === 'activities') {
      setSidePanelOpen(true);
      setSidePanelContent({ type: 'activities' });
      return;
    }
    if (tab !== 'chat') setSidePanelOpen(false);
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
