import { createContext } from 'react'

export type LayoutTab =
  | 'chat'
  | 'activities'
  | 'challenge'
  | 'competenties'
  | 'stappenplan'

export type LayoutContextValue = {
  activeTab: LayoutTab
  selectTab: (tab: LayoutTab) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  sidePanelOpen: boolean
  setSidePanelOpen: (open: boolean) => void
}

export const LayoutContext = createContext<LayoutContextValue | null>(null)
