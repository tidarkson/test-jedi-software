'use client'

import { create } from 'zustand'
import { getDefectsSummary, invalidateDefectsCache } from '@/lib/api/defects'
import { useProjectStore } from './project-store'
import type { DefectRecord, DefectSeverity, DefectStatus } from '@/lib/api/types/defects'

interface DefectsStats {
  open: number
  resolved: number
  /** Map of runId → number of open defects in that run */
  byRun: Record<string, number>
}

interface DefectsStoreState {
  defects: DefectRecord[]
  isLoading: boolean
  error: string | null
  stats: DefectsStats
  /** projectId that was used for the last successful load */
  lastLoadedProjectId: string | null

  loadDefects: (projectId: string) => Promise<void>
  invalidate: () => void
  getDefectsByRun: (runId: string) => DefectRecord[]
  getOpenDefects: () => DefectRecord[]
  getDefectsBySeverity: (severity: DefectSeverity) => DefectRecord[]
  getDefectsByStatus: (status: DefectStatus) => DefectRecord[]
}

function computeStats(defects: DefectRecord[]): DefectsStats {
  const open = defects.filter((d) => d.status === 'open').length
  const resolved = defects.filter((d) => d.status === 'resolved').length

  const byRun: Record<string, number> = {}
  for (const d of defects) {
    if (d.status === 'open') {
      byRun[d.runId] = (byRun[d.runId] ?? 0) + 1
    }
  }

  return { open, resolved, byRun }
}

export const useDefectsStore = create<DefectsStoreState>((set, get) => ({
  defects: [],
  isLoading: false,
  error: null,
  stats: { open: 0, resolved: 0, byRun: {} },
  lastLoadedProjectId: null,

  loadDefects: async (projectId: string) => {
    set({ isLoading: true, error: null })

    try {
      const defects = await getDefectsSummary(projectId)
      const stats = computeStats(defects)

      set({ defects, stats, isLoading: false, lastLoadedProjectId: projectId })

      // Keep the sidebar badge in sync with real open defect count
      useProjectStore.setState((state) => ({
        sidebarCounts: {
          ...state.sidebarCounts,
          openDefects: stats.open,
        },
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load defects'
      set({ isLoading: false, error: message })
    }
  },

  invalidate: () => {
    invalidateDefectsCache()
    set({ defects: [], stats: { open: 0, resolved: 0, byRun: {} }, lastLoadedProjectId: null })
  },

  getDefectsByRun: (runId) => get().defects.filter((d) => d.runId === runId),

  getOpenDefects: () => get().defects.filter((d) => d.status === 'open'),

  getDefectsBySeverity: (severity) => get().defects.filter((d) => d.severity === severity),

  getDefectsByStatus: (status) => get().defects.filter((d) => d.status === status),
}))
