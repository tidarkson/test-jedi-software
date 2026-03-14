'use client'

import * as React from 'react'
import { useProjectStore } from '@/lib/store/project-store'

export function useSidebarCounts() {
  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const sidebarCounts = useProjectStore((state) => state.sidebarCounts)
  const loadSidebarCounts = useProjectStore((state) => state.loadSidebarCounts)

  React.useEffect(() => {
    if (!currentProjectId) {
      useProjectStore.setState((state) => ({
        sidebarCounts: {
          ...state.sidebarCounts,
          activeRuns: 0,
          openDefects: 0,
          isLoading: false,
        },
      }))
      return
    }

    void loadSidebarCounts(currentProjectId)
  }, [currentProjectId, loadSidebarCounts])

  return sidebarCounts
}
