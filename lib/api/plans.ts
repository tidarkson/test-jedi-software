import apiClient from './client'
import type { ApiSuccessResponse } from './types/common'
import type {
  PlanApproveRequest,
  PlanCreateRequest,
  PlanDto,
  PlanReadinessResponse,
  PlanRunDto,
  PlanUpdateRequest,
  PlanVersionDto,
} from './types/plans'

interface PlansPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface PlansListPayload {
  plans?: PlanDto[]
  items?: PlanDto[]
}

function isPlanDto(value: unknown): value is PlanDto {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<PlanDto>
  return typeof candidate.id === 'string' && typeof candidate.projectId === 'string' && typeof candidate.status === 'string'
}

interface PlansListResponse extends ApiSuccessResponse<PlansListPayload | PlanDto[]> {
  pagination?: PlansPagination
}

function normalizePlanPayload(payload: PlansListPayload | PlanDto[] | PlanDto): PlanDto[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if ('plans' in payload && Array.isArray(payload.plans)) {
    return payload.plans
  }

  if ('items' in payload && Array.isArray(payload.items)) {
    return payload.items
  }

  return isPlanDto(payload) ? [payload] : []
}

export async function getPlans(projectId: string): Promise<PlanDto[]> {
  const response = await apiClient.get<PlansListResponse>(`/projects/${projectId}/plans`)
  return normalizePlanPayload(response.data.data)
}

export async function createPlan(projectId: string, data: PlanCreateRequest): Promise<PlanDto> {
  const payload = {
    title: data.name,
    description: data.description,
    milestoneId: data.milestoneId,
    runIds: data.runIds,
  }

  const response = await apiClient.post<ApiSuccessResponse<PlanDto>>(`/projects/${projectId}/plans`, payload)
  return response.data.data
}

export async function getPlan(projectId: string, id: string): Promise<PlanDto> {
  const response = await apiClient.get<ApiSuccessResponse<PlanDto>>(`/projects/${projectId}/plans/${id}`)
  return response.data.data
}

export async function updatePlan(
  projectId: string,
  id: string,
  data: PlanUpdateRequest
): Promise<PlanDto> {
  const payload = {
    ...(data.name ? { title: data.name } : {}),
    ...(data.description !== undefined ? { description: data.description } : {}),
    ...(data.milestoneId !== undefined ? { milestoneId: data.milestoneId } : {}),
    ...(data.status ? { status: data.status.toUpperCase() } : {}),
  }

  const response = await apiClient.put<ApiSuccessResponse<PlanDto>>(
    `/projects/${projectId}/plans/${id}`,
    payload
  )

  return response.data.data
}

export async function approvePlan(
  projectId: string,
  id: string,
  data: PlanApproveRequest = {}
): Promise<PlanDto> {
  const response = await apiClient.post<ApiSuccessResponse<PlanDto>>(
    `/projects/${projectId}/plans/${id}/approve`,
    data
  )

  return response.data.data
}

export async function getPlanReadiness(projectId: string, id: string): Promise<PlanReadinessResponse> {
  const response = await apiClient.get<ApiSuccessResponse<PlanReadinessResponse>>(
    `/projects/${projectId}/plans/${id}/readiness`
  )

  return response.data.data
}

export async function addRunToPlan(projectId: string, id: string, runId: string): Promise<void> {
  await apiClient.post<ApiSuccessResponse<{ runId: string } | Record<string, never>>>(
    `/projects/${projectId}/plans/${id}/runs`,
    { runId }
  )
}

export async function removeRunFromPlan(projectId: string, id: string, runId: string): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(
    `/projects/${projectId}/plans/${id}/runs/${runId}`
  )
}

export async function getPlanVersions(id: string): Promise<PlanVersionDto[]> {
  const response = await apiClient.get<ApiSuccessResponse<PlanVersionDto[]>>(`/plans/${id}/versions`)
  return response.data.data
}

export function getPlanLinkedRuns(plan: PlanDto): PlanRunDto[] {
  return plan.linkedRuns ?? []
}
