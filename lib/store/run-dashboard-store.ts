'use client'

import { create } from 'zustand'
import { 
  RunDashboardData, 
  RunStatus, 
  RiskLevel, 
  TesterPerformance, 
  ActivityFeedItem,
  FailureDistributed,
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
  updateMetrics: (metrics: Partial<RunMetrics>) => void
  addActivityFeedItem: (item: ActivityFeedItem) => void
  fetchRun: (runId: string) => Promise<void>
}

// Mock data generators
export const generateMockRun = (id: string): RunDashboardData => {
  const mockTesterPerformance: TesterPerformance[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      assigned: 25,
      completed: 22,
      passRate: 90.9,
      avgTimePerCase: 3.2,
      avatar: 'A'
    },
    {
      id: '2',
      name: 'Bob Smith',
      assigned: 20,
      completed: 18,
      passRate: 88.9,
      avgTimePerCase: 3.8,
      avatar: 'B'
    },
    {
      id: '3',
      name: 'Carol Davis',
      assigned: 18,
      completed: 17,
      passRate: 94.1,
      avgTimePerCase: 2.9,
      avatar: 'C'
    },
    {
      id: '4',
      name: 'David Wilson',
      assigned: 22,
      completed: 20,
      passRate: 85.0,
      avgTimePerCase: 4.1,
      avatar: 'D'
    },
  ]

  const mockFailureDistribution: FailureDistributed[] = [
    { suiteName: 'Authentication Module', failureCount: 5, passRate: 83.3 },
    { suiteName: 'Payment Processing', failureCount: 8, passRate: 77.8 },
    { suiteName: 'User Management', failureCount: 3, passRate: 91.7 },
    { suiteName: 'Reporting Engine', failureCount: 6, passRate: 85.7 },
    { suiteName: 'API Integration', failureCount: 2, passRate: 94.4 },
  ]

  const mockMetrics: RunMetrics = {
    totalCases: 85,
    completedCases: 77,
    remainingCases: 8,
    passRate: 88.3,
    failRate: 11.7,
    estimatedTime: 240,
    actualTime: 185,
    defectCount: 24,
    riskScore: 'medium' as RiskLevel,
    statusDistribution: {
      passed: 68,
      failed: 9,
      blocked: 0,
      retest: 4,
      skipped: 2,
      untested: 2,
    }
  }

  const mockActivityFeed: ActivityFeedItem[] = [
    {
      id: '1',
      action: 'status_changed',
      actor: { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'engineer' },
      description: 'Changed test case status',
      oldValue: 'failed',
      newValue: 'retest',
      createdAt: new Date(Date.now() - 5 * 60000),
    },
    {
      id: '2',
      action: 'defect_logged',
      actor: { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'engineer' },
      description: 'Logged defect for Payment Processing module',
      createdAt: new Date(Date.now() - 15 * 60000),
    },
    {
      id: '3',
      action: 'case_completed',
      actor: { id: '3', name: 'Carol Davis', email: 'carol@example.com', role: 'engineer' },
      description: 'Completed test case: Login with OAuth',
      newValue: 'passed',
      createdAt: new Date(Date.now() - 25 * 60000),
    },
    {
      id: '4',
      action: 'case_assigned',
      actor: { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'engineer' },
      description: 'Assigned test cases from Authentication Module',
      metadata: { count: 5 },
      createdAt: new Date(Date.now() - 45 * 60000),
    },
    {
      id: '5',
      action: 'run_started',
      actor: { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'engineer' },
      description: 'Started test run execution',
      createdAt: new Date(Date.now() - 180 * 60000),
    },
  ]

  return {
    id,
    title: 'Sprint 23 - Full Regression Testing',
    environment: 'Staging',
    buildNumber: 'v2.5.0-rc.1',
    branch: 'release/v2.5',
    status: 'in_progress' as RunStatus,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    metrics: mockMetrics,
    testerPerformance: mockTesterPerformance,
    failureDistribution: mockFailureDistribution,
    activityFeed: mockActivityFeed,
    createdBy: { id: '1', name: 'John Manager', email: 'john@example.com', role: 'manager' },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  }
}

// Add slight variance to metrics for polling simulation
const addMetricsVariance = (metrics: RunMetrics): RunMetrics => {
  const variance = 0.02 // 2% variance
  return {
    ...metrics,
    completedCases: Math.min(
      metrics.totalCases,
      metrics.completedCases + (Math.random() > 0.7 ? 1 : 0)
    ),
    passRate: Math.max(0, Math.min(100, metrics.passRate + (Math.random() - 0.5) * variance * 100)),
    failRate: Math.max(0, Math.min(100, metrics.failRate + (Math.random() - 0.5) * variance * 100)),
  }
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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      const run = generateMockRun(runId)
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

    // Start polling
    const interval = setInterval(() => {
      const currentRun = get().run
      if (currentRun && currentRun.status !== 'closed') {
        // Simulate metric updates
        const updatedRun: RunDashboardData = {
          ...currentRun,
          metrics: addMetricsVariance(currentRun.metrics),
          updatedAt: new Date(),
          activityFeed: [
            {
              id: `activity-${Date.now()}`,
              action: 'status_changed' as const,
              actor: { id: '1', name: 'System', email: 'system@example.com', role: 'engineer' as const },
              description: 'Metrics updated',
              createdAt: new Date(),
            },
            ...currentRun.activityFeed.slice(0, 9),
          ],
        }
        set({ run: updatedRun, lastUpdated: new Date() })
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

  updateMetrics: (metrics: Partial<RunMetrics>) => {
    const { run } = get()
    if (run) {
      set({
        run: {
          ...run,
          metrics: { ...run.metrics, ...metrics },
          updatedAt: new Date(),
        },
      })
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
