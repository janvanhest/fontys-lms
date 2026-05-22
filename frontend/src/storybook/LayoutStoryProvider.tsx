import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import {
  HIGHLIGHT_DURATION_MS,
  LayoutContext,
  type LayoutContextValue,
  type LayoutTab,
  type SidePanelContent,
} from '@/context/layout-context';

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
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen);
  const [sidePanelOpen, setSidePanelOpen] = useState(initialSidePanelOpen);
  const [sidePanelContent, setSidePanelContent] = useState<SidePanelContent | null>(
    initialSidePanelContent,
  );
  const [highlightedActivityId, setHighlightedActivityId] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    };
  }, []);

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

  const highlightActivity = useCallback((id: string) => {
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    setHighlightedActivityId(id);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedActivityId(null);
    }, HIGHLIGHT_DURATION_MS);
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
      highlightedActivityId,
      highlightActivity,
    }),
    [activeTab, selectTab, selectedConversationId, sidebarOpen, sidePanelOpen, sidePanelContent, openSidePanel, highlightedActivityId, highlightActivity],
  );

  return <LayoutContext value={value}>{children}</LayoutContext>;
}
