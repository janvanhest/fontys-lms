import { useCallback, useMemo, useState, type PropsWithChildren } from 'react'
import {
  LayoutContext,
  type LayoutContextValue,
  type LayoutTab,
} from '@/context/layout-context'

type LayoutStoryProviderProps = PropsWithChildren<{
  activeTab?: LayoutTab
  sidebarOpen?: boolean
  sidePanelOpen?: boolean
}>

export function LayoutStoryProvider({
  activeTab: initialActiveTab = 'chat',
  sidebarOpen: initialSidebarOpen = true,
  sidePanelOpen: initialSidePanelOpen = false,
  children,
}: LayoutStoryProviderProps) {
  const [activeTab, setActiveTab] = useState(initialActiveTab)
  const [sidebarOpen, setSidebarOpen] = useState(initialSidebarOpen)
  const [sidePanelOpen, setSidePanelOpen] = useState(initialSidePanelOpen)

  const selectTab = useCallback((tab: LayoutTab) => {
    setActiveTab(tab)

    if (tab === 'activities') {
      setSidePanelOpen(true)
      return
    }

    if (tab !== 'chat') {
      setSidePanelOpen(false)
    }
  }, [])

  const value = useMemo<LayoutContextValue>(
    () => ({
      activeTab,
      selectTab,
      sidebarOpen,
      setSidebarOpen,
      sidePanelOpen,
      setSidePanelOpen,
    }),
    [activeTab, selectTab, sidebarOpen, sidePanelOpen],
  )

  return <LayoutContext value={value}>{children}</LayoutContext>
}
