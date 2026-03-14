import { getAnalyticsTrends } from './analytics'
import { getPlans } from './plans'
import { getProjectDefectCount, getProjectRunCount } from './projects'
import { getRuns } from './runs'
import type { PlanDto } from './types/plans'
import type { RunDto } from './types/runs'

export interface DashboardSummary {
  activeRunsCount: number
  recentRuns: RunDto[]
  avgPassRate: number
  openDefectsCount: number
  totalCases: number
  plansCount: number
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function getLastSevenDayRange(): { dateFrom: string; dateTo: string } {
  const today = new Date()
  const dateFrom = new Date(today)
  dateFrom.setDate(today.getDate() - 6)

  return {
    dateFrom: formatDate(dateFrom),
    dateTo: formatDate(today),
  }
}

function countOpenPlans(plans: PlanDto[]): number {
  return plans.filter((plan) => {
    const status = plan.status.toUpperCase()
    return status !== 'ARCHIVED' && status !== 'DEPRECATED'
  }).length
}

export async function getDashboardSummary(projectId: string): Promise<DashboardSummary> {
  const { dateFrom, dateTo } = getLastSevenDayRange()

  const [activeRunsCount, recentRuns, trendPoints, plans, openDefectsCount] = await Promise.all([
    getProjectRunCount(projectId),
    getRuns(projectId, {
      page: 1,
      limit: 5,
      sort: 'createdAt:desc',
    }),
    getAnalyticsTrends(projectId, { dateFrom, dateTo }),
    getPlans(projectId),
    getProjectDefectCount(projectId).catch(() => 0),
  ])

  const totals = trendPoints.reduce(
    (accumulator, point) => ({
      passed: accumulator.passed + point.passed,
      total: accumulator.total + point.total,
    }),
    { passed: 0, total: 0 }
  )

  const avgPassRate = totals.total > 0
    ? Number(((totals.passed / totals.total) * 100).toFixed(1))
    : 0

  return {
    activeRunsCount,
    recentRuns,
    avgPassRate,
    openDefectsCount,
    totalCases: totals.total,
    plansCount: countOpenPlans(plans),
  }
}