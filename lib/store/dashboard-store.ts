'use client'

import { create } from 'zustand'
import { getDashboardSummary, type DashboardSummary } from '@/lib/api/dashboard'
import { ApiError } from '@/lib/api/errors'
import type { RunDto } from '@/lib/api/types/runs'

const DASHBOARD_REFRESH_WINDOW_MS = 60_000

interface DashboardStoreState {
  summary: DashboardSummary | null
  recentRuns: RunDto[]
  isLoading: boolean
  error: string | null
  lastFetchedAt: number | null
  currentProjectId: string | null
  loadDashboard: (projectId: string) => Promise<void>
  clearError: () => void
  reset: () => void
}

export const useDashboardStore = create<DashboardStoreState>((set, get) => ({
  summary: null,
  recentRuns: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,
  currentProjectId: null,

  loadDashboard: async (projectId) => {
    const { currentProjectId, lastFetchedAt, summary } = get()
    const isSameProject = currentProjectId === projectId
    const isFresh = isSameProject
      && summary !== null
      && lastFetchedAt !== null
      && Date.now() - lastFetchedAt < DASHBOARD_REFRESH_WINDOW_MS

    if (isFresh) {
      return
    }

    set((state) => ({
      isLoading: true,
      error: null,
      currentProjectId: projectId,
      summary: isSameProject ? state.summary : null,
      recentRuns: isSameProject ? state.recentRuns : [],
      lastFetchedAt: isSameProject ? state.lastFetchedAt : null,
    }))

    try {
      const summary = await getDashboardSummary(projectId)

      set({
        summary,
        recentRuns: summary.recentRuns,
        isLoading: false,
        error: null,
        lastFetchedAt: Date.now(),
        currentProjectId: projectId,
      })
    } catch (error) {
      const apiError = ApiError.fromResponse(error)

      set({
        summary: null,
        recentRuns: [],
        isLoading: false,
        error: apiError.message,
        lastFetchedAt: null,
        currentProjectId: projectId,
      })

      throw apiError
    }
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    summary: null,
    recentRuns: [],
    isLoading: false,
    error: null,
    lastFetchedAt: null,
    currentProjectId: null,
  }),
}))