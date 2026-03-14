import apiClient from './client'
import type { ApiSuccessResponse } from './types/common'
import type {
  BulkRunCaseStatusUpdateRequest,
  RunCaseDto,
  RunCaseUpdateRequest,
  RunCreateRequest,
  RunDto,
  RunListFilters,
  RunMetricsResponse,
  RunPreviewRequest,
  RunPreviewResponse,
} from './types/runs'

interface RunsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
  nextCursor?: string
}

interface PaginatedRunsResponse<T> extends ApiSuccessResponse<T> {
  pagination: RunsPagination
}

interface RawRunDto {
  id: string
  projectId: string
  name?: string
  title?: string
  status: string
  type: string
  environment: string
  startedAt?: string | null
  completedAt?: string | null
  plannedStart?: string | null
  dueDate?: string | null
  buildNumber?: string | null
  branch?: string | null
  createdAt?: string
  updatedAt?: string
}

function normalizeRunDto(run: RawRunDto): RunDto {
  const normalizedStatus = run.status === 'COMPLETED' ? 'CLOSED' : run.status

  return {
    id: run.id,
    projectId: run.projectId,
    name: run.name ?? run.title ?? `Run ${run.id}`,
    status: normalizedStatus as RunDto['status'],
    type: run.type as RunDto['type'],
    environment: run.environment,
    startedAt: run.startedAt ?? run.plannedStart ?? null,
    completedAt: run.completedAt ?? null,
    dueDate: run.dueDate ?? null,
    buildNumber: run.buildNumber,
    branch: run.branch,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  }
}

async function patchOrPutRun(projectId: string, runId: string, payload: Record<string, unknown>) {
  try {
    const patched = await apiClient.patch<ApiSuccessResponse<RawRunDto>>(
      `/projects/${projectId}/runs/${runId}`,
      payload
    )
    return patched
  } catch {
    return apiClient.put<ApiSuccessResponse<RawRunDto>>(
      `/projects/${projectId}/runs/${runId}`,
      payload
    )
  }
}

export async function getRuns(projectId: string, filters?: RunListFilters): Promise<RunDto[]> {
  const response = await apiClient.get<PaginatedRunsResponse<RawRunDto[]>>(`/projects/${projectId}/runs`, {
    params: filters,
  })

  return response.data.data.map(normalizeRunDto)
}

export async function getRun(projectId: string, runId: string): Promise<RunDto> {
  const response = await apiClient.get<ApiSuccessResponse<{ run?: RawRunDto } | RawRunDto>>(
    `/projects/${projectId}/runs/${runId}`
  )

  const payload = response.data.data
  const run = 'run' in payload && payload.run ? payload.run : (payload as RawRunDto)
  return normalizeRunDto(run)
}

export async function createRun(projectId: string, data: RunCreateRequest): Promise<RunDto> {
  const payload = {
    title: data.title,
    type: data.type,
    environment: data.environment ?? 'Staging',
    plannedStart: data.plannedStart,
    dueDate: data.dueDate,
    milestoneId: data.milestoneId,
    buildNumber: data.buildNumber,
    branch: data.branch,
    defaultAssigneeId: data.defaultAssigneeId,
    caseSelection: data.caseSelection,
  }

  const response = await apiClient.post<ApiSuccessResponse<RawRunDto>>(`/projects/${projectId}/runs`, payload)
  return normalizeRunDto(response.data.data)
}

export async function updateRun(
  projectId: string,
  runId: string,
  data: Record<string, unknown>
): Promise<RunDto> {
  const payload = {
    title: data.name,
    environment: data.environment,
    buildNumber: data.buildNumber,
    branch: data.branch,
    dueDate: data.completedAt,
    metrics: data.metrics,
  }

  const response = await patchOrPutRun(projectId, runId, payload)
  return normalizeRunDto(response.data.data)
}

export async function closeRun(projectId: string, runId: string): Promise<void> {
  await apiClient.post<ApiSuccessResponse<RawRunDto>>(`/projects/${projectId}/runs/${runId}/close`)
}

export async function cloneRun(projectId: string, runId: string): Promise<RunDto> {
  const sourceRun = await getRun(projectId, runId)
  const response = await apiClient.post<
    ApiSuccessResponse<{ originalRunId: string; clonedRunId: string; casesCopied: number }>
  >(`/projects/${projectId}/runs/${runId}/clone`, {
    title: `${sourceRun.name} (Clone)`,
  })

  return getRun(projectId, response.data.data.clonedRunId)
}

export async function previewRunCases(
  projectId: string,
  data: RunPreviewRequest
): Promise<RunPreviewResponse> {
  const response = await apiClient.post<
    ApiSuccessResponse<{
      estimatedMinutes?: number
      estimatedTime?: number
      selectedCases?: string[]
      totalCount?: number
    }>
  >(`/projects/${projectId}/runs/preview`, {
    suiteIds: data.suiteIds,
    caseIds: data.caseIds,
    excludeIds: data.excludeIds,
    queryFilters: data.filters,
  })

  const total = response.data.data.totalCount ?? response.data.data.selectedCases?.length ?? 0
  const estimatedMinutes = response.data.data.estimatedMinutes ?? response.data.data.estimatedTime ?? 0
  return {
    count: total,
    estimatedMinutes,
    selectedCaseIds: response.data.data.selectedCases,
  }
}

export async function getRunCases(runId: string): Promise<RunCaseDto[]> {
  const response = await apiClient.get<ApiSuccessResponse<RunCaseDto[]>>(`/runs/${runId}/cases`)
  return response.data.data
}

export async function updateRunCase(
  runId: string,
  runCaseId: string,
  data: RunCaseUpdateRequest
): Promise<void> {
  await apiClient.put<ApiSuccessResponse<RunCaseDto>>(`/runs/${runId}/cases/${runCaseId}`, {
    status: data.status,
    comment: data.comment,
    defectId: data.defectId,
    actualResult: data.actualResult,
  })
}

export async function bulkUpdateRunCases(
  runId: string,
  data: BulkRunCaseStatusUpdateRequest
): Promise<void> {
  await apiClient.post<ApiSuccessResponse<{ updated: number; failed: number }>>(
    `/runs/${runId}/cases/bulk-status`,
    {
      caseIds: data.caseIds,
      status: data.status,
    }
  )
}

export async function getRunMetrics(runId: string): Promise<RunMetricsResponse> {
  const response = await apiClient.get<ApiSuccessResponse<RunMetricsResponse>>(`/runs/${runId}/metrics`)
  return response.data.data
}

export async function exportRun(projectId: string, runId: string): Promise<{ downloadUrl?: string; jobId?: string }> {
  const response = await apiClient.post<ApiSuccessResponse<{ downloadUrl?: string; jobId?: string }>>(
    `/projects/${projectId}/runs/${runId}/export`,
    {
      format: 'json',
      sections: ['summary', 'cases'],
    }
  )

  return response.data.data
}
