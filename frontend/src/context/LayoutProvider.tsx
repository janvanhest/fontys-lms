import { useCallback, useMemo, useState, type PropsWithChildren } from 'react'
import {
  LayoutContext,
  type LayoutContextValue,
  type LayoutTab,
} from '@/context/layout-context'

export function LayoutProvider({ children }: PropsWithChildren) {
  const [activeTab, setActiveTab] = useState<LayoutTab>('chat')
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)

  const selectTab = useCallback((tab: LayoutTab) => {
    setActiveTab(tab)

    if (tab === 'activities') {
      setSidePanelOpen(true)
      return
    }

    if (tab === 'chat') {
      return
    }

    setSidePanelOpen(false)
  }, [])

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
    }),
    [activeTab, selectTab, selectedConversationId, sidebarOpen, sidePanelOpen],
  )

  return <LayoutContext value={value}>{children}</LayoutContext>
}
