import apiClient from './client'
import { getAnalyticsTrends } from './analytics'
import { getPlans } from './plans'
import { getProjectDefectCount, getProjectRunCount } from './projects'
import { getSuites } from './repository'
import { getRuns } from './runs'
import type { ApiSuccessResponse } from './types/common'
import type { PlanDto } from './types/plans'
import type { TestCaseDto } from './types/repository'
import type { RunDto } from './types/runs'
import type { TestSuiteNode } from '@/lib/store/test-repository-store'

export interface DashboardSummary {
  activeRunsCount: number
  recentRuns: RunDto[]
  avgPassRate: number
  openDefectsCount: number
  totalCases: number
  plansCount: number
  repositoryCasesCount: number
  repositorySuitesCount: number
}

interface RepositoryPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
  nextCursor?: string
}

interface PaginatedApiSuccessResponse<T> extends ApiSuccessResponse<T> {
  pagination: RepositoryPagination
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

function flattenSuites(suites: TestSuiteNode[]): TestSuiteNode[] {
  return suites.reduce<TestSuiteNode[]>((accumulator, suite) => {
    accumulator.push(suite)
    if (suite.children.length > 0) {
      accumulator.push(...flattenSuites(suite.children))
    }
    return accumulator
  }, [])
}

async function getRepositoryCaseCount(projectId: string): Promise<number> {
  const response = await apiClient.get<PaginatedApiSuccessResponse<TestCaseDto[]>>(
    `/projects/${projectId}/cases`,
    {
      params: {
        page: 1,
        limit: 1,
      },
    }
  )

  return response.data.pagination?.total ?? 0
}

export async function getDashboardSummary(projectId: string): Promise<DashboardSummary> {
  const { dateFrom, dateTo } = getLastSevenDayRange()

  const [activeRunsCount, recentRuns, trendPoints, plans, openDefectsCount, suites, repositoryCasesCount] = await Promise.all([
    getProjectRunCount(projectId),
    getRuns(projectId, {
      page: 1,
      limit: 5,
      sort: 'createdAt:desc',
    }),
    getAnalyticsTrends(projectId, { dateFrom, dateTo }),
    getPlans(projectId),
    getProjectDefectCount(projectId).catch(() => 0),
    getSuites(projectId),
    getRepositoryCaseCount(projectId),
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
    repositoryCasesCount,
    repositorySuitesCount: flattenSuites(suites).length,
  }
}