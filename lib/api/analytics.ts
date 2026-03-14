import apiClient from './client'
import type { ApiSuccessResponse } from './types/common'
import type { DateRangeFilter } from '@/types'

export interface AnalyticsDateRangeParams {
  dateFrom: string
  dateTo: string
}

export interface TrendsResponsePoint {
  week: string
  passed: number
  failed: number
  blocked: number
  total: number
}

export interface FailureDistributionResponsePoint {
  suiteId: string
  suiteName: string
  failures: number
  percentage: number
}

export interface SuiteHeatmapCell {
  suiteId: string
  suiteName: string
  week: string
  failed: number
  total: number
  failureRate: number
}

export interface SuiteHeatmapResponse {
  weeks: string[]
  suites: Array<{ suiteId: string; suiteName: string }>
  grid: SuiteHeatmapCell[]
}

export interface AutomationCoverageResponse {
  counts: {
    automated: number
    manual: number
    untested: number
    total: number
  }
  weeklyTrend: Array<{
    week: string
    automatedCases: number
    totalCases: number
    coveragePercent: number
  }>
}

export interface DefectLeakageResponsePoint {
  week: string
  foundInProd: number
  foundInTesting: number
  total: number
}

export interface FlakyTestsResponsePoint {
  caseId: string
  title: string
  flakyScore: number
  lastRunResults: string[]
}

export interface WorkloadHeatmapCell {
  testerId: string
  testerName: string
  day: string
  assignedCases: number
}

export interface WorkloadHeatmapResponse {
  days: string[]
  testers: Array<{ testerId: string; testerName: string }>
  grid: WorkloadHeatmapCell[]
}

export type AnalyticsExportFormat = 'pdf' | 'xlsx'

export interface AnalyticsExportRequest {
  format: AnalyticsExportFormat
  sections: string[]
  filters: {
    startDate: string
    endDate: string
  }
}

export interface AnalyticsExportResponse {
  jobId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  format: string
  downloadUrl?: string
  fileSize?: number
  createdAt: string
  completedAt?: string
  error?: string
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function subtractDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() - days)
  return next
}

export function resolveDateRangeParams(range: DateRangeFilter): AnalyticsDateRangeParams {
  const now = new Date()

  if (range.range === 'custom' && range.startDate && range.endDate) {
    return {
      dateFrom: formatDate(range.startDate),
      dateTo: formatDate(range.endDate),
    }
  }

  if (range.range === 'last_7d') {
    return {
      dateFrom: formatDate(subtractDays(now, 6)),
      dateTo: formatDate(now),
    }
  }

  if (range.range === 'last_90d') {
    return {
      dateFrom: formatDate(subtractDays(now, 89)),
      dateTo: formatDate(now),
    }
  }

  return {
    dateFrom: formatDate(subtractDays(now, 29)),
    dateTo: formatDate(now),
  }
}

interface AnalyticsQueryParams extends AnalyticsDateRangeParams {
  milestoneId?: string
}

export async function getAnalyticsTrends(projectId: string, params: AnalyticsQueryParams): Promise<TrendsResponsePoint[]> {
  const response = await apiClient.get<ApiSuccessResponse<TrendsResponsePoint[]>>(
    `/projects/${projectId}/analytics/trends`,
    { params }
  )

  return response.data.data
}

export async function getAnalyticsFailureDistribution(
  projectId: string,
  params: AnalyticsQueryParams
): Promise<FailureDistributionResponsePoint[]> {
  const response = await apiClient.get<ApiSuccessResponse<FailureDistributionResponsePoint[]>>(
    `/projects/${projectId}/analytics/failure-distribution`,
    { params }
  )

  return response.data.data
}

export async function getAnalyticsSuiteHeatmap(projectId: string, params: AnalyticsQueryParams): Promise<SuiteHeatmapResponse> {
  const response = await apiClient.get<ApiSuccessResponse<SuiteHeatmapResponse>>(
    `/projects/${projectId}/analytics/suite-heatmap`,
    { params }
  )

  return response.data.data
}

export async function getAnalyticsAutomationCoverage(
  projectId: string,
  params: AnalyticsQueryParams
): Promise<AutomationCoverageResponse> {
  const response = await apiClient.get<ApiSuccessResponse<AutomationCoverageResponse>>(
    `/projects/${projectId}/analytics/automation-coverage`,
    { params }
  )

  return response.data.data
}

export async function getAnalyticsDefectLeakage(
  projectId: string,
  params: AnalyticsQueryParams
): Promise<DefectLeakageResponsePoint[]> {
  const response = await apiClient.get<ApiSuccessResponse<DefectLeakageResponsePoint[]>>(
    `/projects/${projectId}/analytics/defect-leakage`,
    { params }
  )

  return response.data.data
}

export async function getAnalyticsFlakyTests(
  projectId: string,
  params: AnalyticsQueryParams
): Promise<FlakyTestsResponsePoint[]> {
  const response = await apiClient.get<ApiSuccessResponse<FlakyTestsResponsePoint[]>>(
    `/projects/${projectId}/analytics/flaky-tests`,
    { params }
  )

  return response.data.data
}

export async function getAnalyticsWorkloadHeatmap(
  projectId: string,
  params: AnalyticsQueryParams
): Promise<WorkloadHeatmapResponse> {
  const response = await apiClient.get<ApiSuccessResponse<WorkloadHeatmapResponse>>(
    `/projects/${projectId}/analytics/workload-heatmap`,
    { params }
  )

  return response.data.data
}

export async function exportAnalytics(
  projectId: string,
  payload: AnalyticsExportRequest
): Promise<AnalyticsExportResponse> {
  const response = await apiClient.post<ApiSuccessResponse<AnalyticsExportResponse>>(
    '/analytics/export',
    payload,
    {
      params: { projectId },
    }
  )

  return response.data.data
}

export async function getAnalyticsExportStatus(jobId: string): Promise<AnalyticsExportResponse> {
  const response = await apiClient.get<ApiSuccessResponse<AnalyticsExportResponse>>(`/exports/${jobId}`)
  return response.data.data
}