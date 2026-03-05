'use client'

import { create } from 'zustand'
import { 
  AnalyticsData,
  DateRangeFilter,
  PassFailTrend,
  FailureDistributionData,
  AutomationCoverageTrend,
  SuiteHealthHeatmap,
  SuiteHealthScore,
  DefectLeakageTrend,
  DefectStatus,
  MTTRMetrics,
  WorkloadHeatmap,
  TesterLeaderboardEntry,
  ExecutionVelocity,
} from '@/types'

interface AnalyticsStoreState {
  data: AnalyticsData | null
  isLoading: boolean
  dateRange: DateRangeFilter
  selectedMilestone?: string
  selectedEnvironment?: string
  setDateRange: (range: DateRangeFilter) => void
  setMilestone: (milestone: string) => void
  setEnvironment: (environment: string) => void
  fetchAnalytics: (filters?: { milestone?: string; environment?: string }) => Promise<void>
  refreshData: () => Promise<void>
}

// Mock data generators
const generatePassFailTrends = (weeks: number): PassFailTrend[] => {
  const trends: PassFailTrend[] = []
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() - weeks * 7)

  for (let i = 0; i < weeks; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i * 7)
    const passed = Math.floor(Math.random() * 80) + 60
    const failed = Math.floor(Math.random() * 20)
    const total = passed + failed

    trends.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      passed,
      failed,
      passRate: Math.round((passed / total) * 100),
    })
  }
  return trends
}

const generateFailureDistribution = (): FailureDistributionData[] => {
  const suites = [
    'Authentication Module',
    'Payment Processing',
    'User Management',
    'Reporting Engine',
    'API Integration',
  ]
  const total = suites.reduce((sum, _, i) => sum + (i + 1) * 3, 0)

  return suites.map((suite, i) => ({
    suiteName: suite,
    value: (i + 1) * 3,
    percentage: Math.round(((i + 1) * 3 / total) * 100),
  }))
}

const generateAutomationCoverage = (weeks: number): AutomationCoverageTrend[] => {
  const trends: AutomationCoverageTrend[] = []
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() - weeks * 7)

  for (let i = 0; i < weeks; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i * 7)
    const coverage = Math.min(100, 45 + i * 3 + Math.random() * 10)

    trends.push({
      week: `W${i + 1}`,
      coverage: Math.round(coverage),
      automated: Math.floor(coverage / 100 * 85),
      manual: Math.floor((100 - coverage) / 100 * 85),
    })
  }
  return trends
}

const generateSuiteHealthHeatmap = (): SuiteHealthHeatmap[] => {
  const suites = [
    'Authentication',
    'Payment Processing',
    'User Management',
    'Reporting Engine',
  ]

  return suites.map((suite, idx) => ({
    suiteName: suite,
    suiteId: `suite-${idx}`,
    failuresByWeek: Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)),
    weekLabels: Array.from({ length: 12 }, (_, i) => `W${i + 1}`),
  }))
}

const generateSuiteHealthScores = (): SuiteHealthScore[] => {
  const suites = [
    'Authentication',
    'Payment Processing',
    'User Management',
    'Reporting Engine',
    'API Integration',
  ]

  return suites.map((suite, idx) => ({
    suiteId: `suite-${idx}`,
    suiteName: suite,
    totalCases: Math.floor(Math.random() * 40) + 20,
    lastRunDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    passRate: Math.round(Math.random() * 30) + 70,
    flakyCount: Math.floor(Math.random() * 5),
    healthScore: Math.round(Math.random() * 30) + 70,
  }))
}

const generateDefectLeakageTrend = (weeks: number): DefectLeakageTrend[] => {
  const trends: DefectLeakageTrend[] = []

  for (let i = 0; i < weeks; i++) {
    const leakageRate = Math.max(2, 8 - i * 0.3 + Math.random() * 3)
    trends.push({
      week: `W${i + 1}`,
      leakageRate: Math.round(leakageRate * 100) / 100,
      defectsLeaked: Math.floor(leakageRate * 100 / 100 * 50),
    })
  }
  return trends
}

const generateDefectStatus = (weeks: number): DefectStatus[] => {
  const status: DefectStatus[] = []

  for (let i = 0; i < weeks; i++) {
    const open = Math.floor(Math.random() * 30) + 10
    const closed = Math.floor(Math.random() * 50) + 20

    status.push({
      week: `W${i + 1}`,
      open,
      closed,
    })
  }
  return status
}

const generateWorkloadHeatmap = (): WorkloadHeatmap[] => {
  const testers = [
    'Alice Johnson',
    'Bob Smith',
    'Carol Davis',
    'David Wilson',
  ]

  return testers.map((tester, idx) => ({
    testerName: tester,
    testerId: `tester-${idx}`,
    executionByDay: Array.from({ length: 7 }, () => Math.floor(Math.random() * 15) + 5),
    dayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  }))
}

const generateTesterLeaderboard = (): TesterLeaderboardEntry[] => {
  const testers = [
    { name: 'Alice Johnson', completed: 85, passRate: 93 },
    { name: 'Carol Davis', completed: 82, passRate: 91 },
    { name: 'Bob Smith', completed: 78, passRate: 88 },
    { name: 'David Wilson', completed: 75, passRate: 85 },
  ]

  return testers
    .map((tester, idx) => ({
      testerId: `tester-${idx}`,
      testerName: tester.name,
      completed: tester.completed,
      passRate: tester.passRate,
      avgTimePerCase: Math.round(Math.random() * 2) + 2,
      rank: idx + 1,
    }))
    .sort((a, b) => b.passRate - a.passRate)
}

const generateExecutionVelocity = (weeks: number): ExecutionVelocity[] => {
  const velocity: ExecutionVelocity[] = []
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() - weeks * 7)
  const baseVelocity = 25

  for (let i = 0; i < weeks; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i * 7)
    const executedCases = Math.floor(baseVelocity + Math.random() * 15 - 5)

    velocity.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      executedCases,
      velocity: executedCases,
    })
  }
  return velocity
}

const generateMockAnalyticsData = (): AnalyticsData => ({
  qualityTrends: {
    passFailTrends: generatePassFailTrends(12),
    failureDistribution: generateFailureDistribution(),
    automationCoverage: generateAutomationCoverage(12),
  },
  suiteHealth: {
    heatmaps: generateSuiteHealthHeatmap(),
    healthScores: generateSuiteHealthScores(),
  },
  defectAnalytics: {
    leakageTrend: generateDefectLeakageTrend(12),
    defectStatus: generateDefectStatus(12),
    mttr: {
      current: 18,
      average: 22,
      trend: 'down',
    },
  },
  teamPerformance: {
    workloadHeatmaps: generateWorkloadHeatmap(),
    leaderboard: generateTesterLeaderboard(),
    velocity: generateExecutionVelocity(12),
  },
})

export const useAnalyticsStore = create<AnalyticsStoreState>((set) => ({
  data: null,
  isLoading: false,
  dateRange: { range: 'last_30d' },
  selectedMilestone: undefined,
  selectedEnvironment: undefined,

  setDateRange: (range) => set({ dateRange: range }),
  setMilestone: (milestone) => set({ selectedMilestone: milestone }),
  setEnvironment: (environment) => set({ selectedEnvironment: environment }),

  fetchAnalytics: async (filters) => {
    set({ isLoading: true })
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const data = generateMockAnalyticsData()
      set({ data, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      set({ isLoading: false })
    }
  },

  refreshData: async () => {
    set({ isLoading: true })
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      const data = generateMockAnalyticsData()
      set({ data, isLoading: false })
    } catch (error) {
      console.error('Failed to refresh analytics:', error)
      set({ isLoading: false })
    }
  },
}))
