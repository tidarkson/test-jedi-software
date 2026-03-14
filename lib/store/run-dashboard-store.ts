'use client'

import { create } from 'zustand'
import { getRun, getRunMetrics, updateRun } from '@/lib/api/runs'
import { mapRunMetricsResponse, runDtoToRunDashboardData } from '@/lib/api/adapters/runs'
import { useProjectStore } from './project-store'
import { 
  RunDashboardData, 
  ActivityFeedItem,
  RunMetrics 
} from '@/types'

interface RunDashboardState {
  run: RunDashboardData | null
  isLoading: boolean
  isPolling: boolean
  pollingInterval: NodeJS.Timeout | null
  lastUpdated: Date | null
  setRun: (run: RunDashboardData) => void
  startPolling: (runId: string, intervalMs?: number) => void
  stopPolling: () => void
  updateMetrics: (metrics: Partial<RunMetrics>) => Promise<void>
  addActivityFeedItem: (item: ActivityFeedItem) => void
  fetchRun: (runId: string) => Promise<void>
}

function getCurrentProjectId(): string {
  const projectId = useProjectStore.getState().currentProjectId
  if (!projectId) {
    throw new Error('No active project selected')
  }

  return projectId
}

export const useRunDashboardStore = create<RunDashboardState>((set, get) => ({
  run: null,
  isLoading: false,
  isPolling: false,
  pollingInterval: null,
  lastUpdated: null,

  setRun: (run: RunDashboardData) => {
    set({ run, lastUpdated: new Date() })
  },

  fetchRun: async (runId: string) => {
    set({ isLoading: true })
    try {
      const projectId = getCurrentProjectId()
      const [runDto, metrics] = await Promise.all([
        getRun(projectId, runId),
        getRunMetrics(runId),
      ])

      const run = runDtoToRunDashboardData(runDto, metrics)
      set({ run, isLoading: false, lastUpdated: new Date() })
    } catch (error) {
      console.error('Error fetching run:', error)
      set({ isLoading: false })
    }
  },

  startPolling: (runId: string, intervalMs = 10000) => {
    const state = get()
    
    // Stop existing polling if any
    if (state.pollingInterval) {
      clearInterval(state.pollingInterval)
    }

    // Initial fetch
    get().fetchRun(runId)

    // Start polling (metrics endpoint only)
    const interval = setInterval(async () => {
      const currentRun = get().run
      if (currentRun && currentRun.status !== 'closed') {
        try {
          const metrics = await getRunMetrics(runId)
          set({
            run: {
              ...currentRun,
              metrics: mapRunMetricsResponse(metrics),
              testerPerformance: metrics.testerPerformance.map((tester) => ({
                id: tester.testerId,
                name: tester.testerName,
                assigned: tester.casesHandled,
                completed: tester.casesHandled,
                passRate: tester.passRate,
                avgTimePerCase: tester.averageTimePerCase,
                avatar: tester.testerName.charAt(0).toUpperCase(),
              })),
              updatedAt: new Date(),
            },
            lastUpdated: new Date(),
          })
        } catch (error) {
          console.error('Error polling run metrics:', error)
        }
      }
    }, intervalMs)

    set({ pollingInterval: interval, isPolling: true })
  },

  stopPolling: () => {
    const state = get()
    if (state.pollingInterval) {
      clearInterval(state.pollingInterval)
    }
    set({ pollingInterval: null, isPolling: false })
  },

  updateMetrics: async (metrics: Partial<RunMetrics>) => {
    const { run } = get()
    if (run) {
      set({
        run: {
          ...run,
          metrics: { ...run.metrics, ...metrics },
          updatedAt: new Date(),
        },
      })

      try {
        const projectId = getCurrentProjectId()
        await updateRun(projectId, run.id, {
          name: run.title,
          environment: run.environment,
          buildNumber: run.buildNumber,
          branch: run.branch,
          metrics: {
            ...run.metrics,
            ...metrics,
          },
        })
      } catch (error) {
        console.error('Error persisting run metrics:', error)
      }
    }
  },

  addActivityFeedItem: (item: ActivityFeedItem) => {
    const { run } = get()
    if (run) {
      set({
        run: {
          ...run,
          activityFeed: [item, ...run.activityFeed.slice(0, 9)],
          updatedAt: new Date(),
        },
      })
    }
  },
}))
