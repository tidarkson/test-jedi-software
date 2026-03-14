'use client'

import { create } from 'zustand'
import {
  getAnalyticsAutomationCoverage,
  getAnalyticsDefectLeakage,
  getAnalyticsFailureDistribution,
  getAnalyticsFlakyTests,
  getAnalyticsSuiteHeatmap,
  getAnalyticsTrends,
  getAnalyticsWorkloadHeatmap,
  resolveDateRangeParams,
  type DefectLeakageResponsePoint,
  type FlakyTestsResponsePoint,
  type SuiteHeatmapResponse,
  type TrendsResponsePoint,
  type WorkloadHeatmapResponse,
} from '@/lib/api/analytics'
import {
  AnalyticsData,
  DateRangeFilter,
  FailureDistributionData,
  MTTRMetrics,
  SuiteHealthScore,
  TesterLeaderboardEntry,
} from '@/types'

interface AnalyticsSectionLoading {
  passFailTrend: boolean
  failureDistribution: boolean
  automationCoverage: boolean
  suiteHeatmap: boolean
  suiteHealthScores: boolean
  defectLeakageTrend: boolean
  defectStatus: boolean
  mttr: boolean
  workloadHeatmap: boolean
  executionVelocity: boolean
  testerLeaderboard: boolean
}

interface AnalyticsStoreState {
  data: AnalyticsData | null
  isLoading: boolean
  sectionLoading: AnalyticsSectionLoading
  dateRange: DateRangeFilter
  selectedMilestone?: string
  selectedEnvironment?: string
  currentProjectId: string | null
  activeRequestId: number
  setDateRange: (range: DateRangeFilter) => void
  setMilestone: (milestone: string) => void
  setEnvironment: (environment: string) => void
  fetchAnalytics: (projectId: string, dateRange?: DateRangeFilter) => Promise<void>
  refreshData: () => Promise<void>
}

const defaultMTTR: MTTRMetrics = {
  current: 0,
  average: 0,
  trend: 'stable',
}

const defaultSectionLoading: AnalyticsSectionLoading = {
  passFailTrend: false,
  failureDistribution: false,
  automationCoverage: false,
  suiteHeatmap: false,
  suiteHealthScores: false,
  defectLeakageTrend: false,
  defectStatus: false,
  mttr: false,
  workloadHeatmap: false,
  executionVelocity: false,
  testerLeaderboard: false,
}

function createEmptyAnalyticsData(): AnalyticsData {
  return {
    qualityTrends: {
      passFailTrends: [],
      failureDistribution: [],
      automationCoverage: [],
    },
    suiteHealth: {
      heatmaps: [],
      healthScores: [],
    },
    defectAnalytics: {
      leakageTrend: [],
      defectStatus: [],
      mttr: defaultMTTR,
    },
    teamPerformance: {
      workloadHeatmaps: [],
      leaderboard: [],
      velocity: [],
    },
  }
}

function formatDateLabel(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function buildFailureDistribution(points: Array<{ suiteName: string; failures: number; percentage: number }>): FailureDistributionData[] {
  return points.map((point) => ({
    suiteName: point.suiteName,
    value: point.failures,
    percentage: Math.round(point.percentage),
  }))
}

function buildDefectMetrics(points: DefectLeakageResponsePoint[]): {
  leakageTrend: AnalyticsData['defectAnalytics']['leakageTrend']
  defectStatus: AnalyticsData['defectAnalytics']['defectStatus']
  mttr: MTTRMetrics
} {
  const leakageTrend = points.map((point) => {
    const leakageRate = point.total > 0 ? Number(((point.foundInProd / point.total) * 100).toFixed(2)) : 0

    return {
      week: formatDateLabel(point.week),
      leakageRate,
      defectsLeaked: point.foundInProd,
    }
  })

  const defectStatus = points.map((point) => ({
    week: formatDateLabel(point.week),
    open: point.foundInProd,
    closed: point.foundInTesting,
  }))

  const resolvedCounts = points.map((point) => point.foundInTesting)
  const current = Math.max(0, resolvedCounts[resolvedCounts.length - 1] ?? 0)
  const average = resolvedCounts.length > 0
    ? Math.round(resolvedCounts.reduce((sum, value) => sum + value, 0) / resolvedCounts.length)
    : 0

  const trend: MTTRMetrics['trend'] = current > average ? 'up' : current < average ? 'down' : 'stable'

  return {
    leakageTrend,
    defectStatus,
    mttr: {
      current,
      average,
      trend,
    },
  }
}

function buildSuiteHeatmap(response: SuiteHeatmapResponse): AnalyticsData['suiteHealth']['heatmaps'] {
  return response.suites.map((suite) => {
    const failuresByWeek = response.weeks.map((week) => {
      const cell = response.grid.find((gridCell) => gridCell.suiteId === suite.suiteId && gridCell.week === week)
      return cell?.failed ?? 0
    })

    return {
      suiteId: suite.suiteId,
      suiteName: suite.suiteName,
      failuresByWeek,
      weekLabels: response.weeks.map(formatDateLabel),
    }
  })
}

function buildSuiteHealthScores(
  heatmapResponse: SuiteHeatmapResponse,
  flakyTests: FlakyTestsResponsePoint[]
): SuiteHealthScore[] {
  const flakyCount = flakyTests.length
  const lastWeek = heatmapResponse.weeks[heatmapResponse.weeks.length - 1]
  const lastRunDate = lastWeek ? new Date(lastWeek) : new Date()

  return heatmapResponse.suites.map((suite) => {
    const suiteCells = heatmapResponse.grid.filter((cell) => cell.suiteId === suite.suiteId)
    const totalCases = suiteCells.reduce((sum, cell) => sum + cell.total, 0)
    const totalFailures = suiteCells.reduce((sum, cell) => sum + cell.failed, 0)
    const passRate = totalCases > 0 ? Math.round(((totalCases - totalFailures) / totalCases) * 100) : 0
    const healthScore = Math.max(0, Math.min(100, passRate - Math.min(flakyCount, 20)))

    return {
      suiteId: suite.suiteId,
      suiteName: suite.suiteName,
      totalCases,
      lastRunDate,
      passRate,
      flakyCount,
      healthScore,
    }
  })
}

function buildTeamMetrics(
  workloadResponse: WorkloadHeatmapResponse,
  trends: TrendsResponsePoint[]
): {
  workloadHeatmaps: AnalyticsData['teamPerformance']['workloadHeatmaps']
  leaderboard: TesterLeaderboardEntry[]
  velocity: AnalyticsData['teamPerformance']['velocity']
} {
  const workloadHeatmaps = workloadResponse.testers.map((tester) => {
    const executionByDay = workloadResponse.days.map((day) => {
      const cell = workloadResponse.grid.find(
        (gridCell) => gridCell.testerId === tester.testerId && gridCell.day === day
      )

      return cell?.assignedCases ?? 0
    })

    return {
      testerId: tester.testerId,
      testerName: tester.testerName,
      executionByDay,
      dayLabels: workloadResponse.days.map(formatDateLabel),
    }
  })

  const averagePassRate = trends.length > 0
    ? Math.round(
      trends.reduce((sum, trend) => {
        const passRate = trend.total > 0 ? (trend.passed / trend.total) * 100 : 0
        return sum + passRate
      }, 0) / trends.length
    )
    : 0

  const leaderboard = workloadHeatmaps
    .map((tester) => ({
      testerId: tester.testerId,
      testerName: tester.testerName,
      completed: tester.executionByDay.reduce((sum, value) => sum + value, 0),
      passRate: averagePassRate,
      avgTimePerCase: 5,
      rank: 0,
    }))
    .sort((first, second) => second.completed - first.completed)
    .map((tester, index) => ({
      ...tester,
      rank: index + 1,
    }))

  const velocity = trends.map((trend) => ({
    date: formatDateLabel(trend.week),
    executedCases: trend.total,
    velocity: trend.total,
  }))

  return {
    workloadHeatmaps,
    leaderboard,
    velocity,
  }
}

export const useAnalyticsStore = create<AnalyticsStoreState>((set, get) => ({
  data: null,
  isLoading: false,
  sectionLoading: defaultSectionLoading,
  dateRange: { range: 'last_30d' },
  selectedMilestone: undefined,
  selectedEnvironment: undefined,
  currentProjectId: null,
  activeRequestId: 0,

  setDateRange: (range) => set({ dateRange: range }),
  setMilestone: (milestone) => set({ selectedMilestone: milestone }),
  setEnvironment: (environment) => set({ selectedEnvironment: environment }),

  fetchAnalytics: async (projectId, dateRange) => {
    const requestId = Date.now()
    const targetRange = dateRange ?? get().dateRange
    const selectedMilestone = get().selectedMilestone
    const milestoneId = selectedMilestone && selectedMilestone !== 'all' ? selectedMilestone : undefined
    const queryParams = {
      ...resolveDateRangeParams(targetRange),
      ...(milestoneId ? { milestoneId } : {}),
    }

    set((state) => ({
      currentProjectId: projectId,
      dateRange: targetRange,
      data: state.data ?? createEmptyAnalyticsData(),
      isLoading: true,
      activeRequestId: requestId,
      sectionLoading: {
        passFailTrend: true,
        failureDistribution: true,
        automationCoverage: true,
        suiteHeatmap: true,
        suiteHealthScores: true,
        defectLeakageTrend: true,
        defectStatus: true,
        mttr: true,
        workloadHeatmap: true,
        executionVelocity: true,
        testerLeaderboard: true,
      },
    }))

    let trendsResponse: TrendsResponsePoint[] = []
    let suiteHeatmapResponse: SuiteHeatmapResponse = { weeks: [], suites: [], grid: [] }
    let flakyTestsResponse: FlakyTestsResponsePoint[] = []
    let workloadHeatmapResponse: WorkloadHeatmapResponse = { days: [], testers: [], grid: [] }

    const isCurrentRequest = () => get().activeRequestId === requestId

    const tasks = [
      getAnalyticsTrends(projectId, queryParams)
        .then((response) => {
          trendsResponse = response
          if (!isCurrentRequest()) {
            return
          }

          set((state) => {
            const currentData = state.data ?? createEmptyAnalyticsData()
            return {
              data: {
                ...currentData,
                qualityTrends: {
                  ...currentData.qualityTrends,
                  passFailTrends: response.map((point) => ({
                    date: formatDateLabel(point.week),
                    passed: point.passed,
                    failed: point.failed,
                    passRate: point.total > 0 ? Math.round((point.passed / point.total) * 100) : 0,
                  })),
                },
                teamPerformance: {
                  ...currentData.teamPerformance,
                  velocity: response.map((point) => ({
                    date: formatDateLabel(point.week),
                    executedCases: point.total,
                    velocity: point.total,
                  })),
                },
              },
            }
          })
        })
        .finally(() => {
          if (!isCurrentRequest()) {
            return
          }

          set((state) => ({
            sectionLoading: {
              ...state.sectionLoading,
              passFailTrend: false,
              executionVelocity: false,
            },
          }))
        }),

      getAnalyticsFailureDistribution(projectId, queryParams)
        .then((response) => {
          if (!isCurrentRequest()) {
            return
          }

          set((state) => {
            const currentData = state.data ?? createEmptyAnalyticsData()
            return {
              data: {
                ...currentData,
                qualityTrends: {
                  ...currentData.qualityTrends,
                  failureDistribution: buildFailureDistribution(response),
                },
              },
            }
          })
        })
        .finally(() => {
          if (!isCurrentRequest()) {
            return
          }

          set((state) => ({
            sectionLoading: {
              ...state.sectionLoading,
              failureDistribution: false,
            },
          }))
        }),

      getAnalyticsAutomationCoverage(projectId, queryParams)
        .then((response) => {
          if (!isCurrentRequest()) {
            return
          }

          set((state) => {
            const currentData = state.data ?? createEmptyAnalyticsData()
            return {
              data: {
                ...currentData,
                qualityTrends: {
                  ...currentData.qualityTrends,
                  automationCoverage: response.weeklyTrend.map((point) => ({
                    week: formatDateLabel(point.week),
                    coverage: Math.round(point.coveragePercent),
                    automated: point.automatedCases,
                    manual: Math.max(point.totalCases - point.automatedCases, 0),
                  })),
                },
              },
            }
          })
        })
        .finally(() => {
          if (!isCurrentRequest()) {
            return
          }

          set((state) => ({
            sectionLoading: {
              ...state.sectionLoading,
              automationCoverage: false,
            },
          }))
        }),

      getAnalyticsSuiteHeatmap(projectId, queryParams)
        .then((response) => {
          suiteHeatmapResponse = response
          if (!isCurrentRequest()) {
            return
          }

          set((state) => {
            const currentData = state.data ?? createEmptyAnalyticsData()
            return {
              data: {
                ...currentData,
                suiteHealth: {
                  ...currentData.suiteHealth,
                  heatmaps: buildSuiteHeatmap(response),
                },
              },
            }
          })
        })
        .finally(() => {
          if (!isCurrentRequest()) {
            return
          }

          set((state) => ({
            sectionLoading: {
              ...state.sectionLoading,
              suiteHeatmap: false,
            },
          }))
        }),

      getAnalyticsDefectLeakage(projectId, queryParams)
        .then((response) => {
          if (!isCurrentRequest()) {
            return
          }

          const metrics = buildDefectMetrics(response)

          set((state) => {
            const currentData = state.data ?? createEmptyAnalyticsData()
            return {
              data: {
                ...currentData,
                defectAnalytics: {
                  ...currentData.defectAnalytics,
                  leakageTrend: metrics.leakageTrend,
                  defectStatus: metrics.defectStatus,
                  mttr: metrics.mttr,
                },
              },
            }
          })
        })
        .finally(() => {
          if (!isCurrentRequest()) {
            return
          }

          set((state) => ({
            sectionLoading: {
              ...state.sectionLoading,
              defectLeakageTrend: false,
              defectStatus: false,
              mttr: false,
            },
          }))
        }),

      getAnalyticsFlakyTests(projectId, queryParams)
        .then((response) => {
          flakyTestsResponse = response
        }),

      getAnalyticsWorkloadHeatmap(projectId, queryParams)
        .then((response) => {
          workloadHeatmapResponse = response
          if (!isCurrentRequest()) {
            return
          }

          set((state) => {
            const currentData = state.data ?? createEmptyAnalyticsData()
            return {
              data: {
                ...currentData,
                teamPerformance: {
                  ...currentData.teamPerformance,
                  workloadHeatmaps: response.testers.map((tester) => {
                    const executionByDay = response.days.map((day) => {
                      const cell = response.grid.find(
                        (gridCell) => gridCell.testerId === tester.testerId && gridCell.day === day
                      )
                      return cell?.assignedCases ?? 0
                    })

                    return {
                      testerId: tester.testerId,
                      testerName: tester.testerName,
                      executionByDay,
                      dayLabels: response.days.map(formatDateLabel),
                    }
                  }),
                },
              },
            }
          })
        })
        .finally(() => {
          if (!isCurrentRequest()) {
            return
          }

          set((state) => ({
            sectionLoading: {
              ...state.sectionLoading,
              workloadHeatmap: false,
            },
          }))
        }),
    ]

    try {
      await Promise.allSettled(tasks)

      if (!isCurrentRequest()) {
        return
      }

      const teamMetrics = buildTeamMetrics(workloadHeatmapResponse, trendsResponse)
      const suiteHealthScores = buildSuiteHealthScores(suiteHeatmapResponse, flakyTestsResponse)

      set((state) => {
        const currentData = state.data ?? createEmptyAnalyticsData()
        return {
          data: {
            ...currentData,
            suiteHealth: {
              ...currentData.suiteHealth,
              healthScores: suiteHealthScores,
            },
            teamPerformance: {
              ...currentData.teamPerformance,
              workloadHeatmaps: teamMetrics.workloadHeatmaps,
              leaderboard: teamMetrics.leaderboard,
              velocity: teamMetrics.velocity,
            },
          },
          sectionLoading: {
            ...state.sectionLoading,
            suiteHealthScores: false,
            testerLeaderboard: false,
            executionVelocity: false,
          },
        }
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      if (!isCurrentRequest()) {
        return
      }

      set({
        isLoading: false,
        sectionLoading: {
          ...defaultSectionLoading,
        },
      })
    }
  },

  refreshData: async () => {
    const { currentProjectId, dateRange, fetchAnalytics } = get()

    if (!currentProjectId) {
      return
    }

    await fetchAnalytics(currentProjectId, dateRange)
  },
}))
