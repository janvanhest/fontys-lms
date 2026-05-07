import { use } from 'react'
import { LayoutContext } from '@/context/layout-context'

export function useLayout() {
  const context = use(LayoutContext)

  if (context === null) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }

  return context
}
