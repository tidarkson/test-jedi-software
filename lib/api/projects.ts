import apiClient from './client'
import { ApiError } from './errors'
import type { ApiSuccessResponse } from './types/common'
import type {
  CreateProjectRequestDto,
  Project,
  ProjectDto,
  ProjectSettingsDto,
} from './types/projects'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function toProject(dto: ProjectDto): Project {
  const settings = (dto.settings ?? {}) as ProjectSettingsDto

  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description ?? undefined,
    color: dto.color ?? settings.color ?? undefined,
    icon: dto.icon ?? settings.icon ?? undefined,
  }
}

function normalizeProjectsPayload(payload: unknown): Project[] {
  if (Array.isArray(payload)) {
    return payload.map((item) => toProject(item as ProjectDto))
  }

  if (isObject(payload) && Array.isArray(payload.items)) {
    return payload.items.map((item) => toProject(item as ProjectDto))
  }

  return []
}

function normalizeProjectPayload(payload: unknown): Project {
  if (!isObject(payload)) {
    throw new ApiError({
      code: 500,
      error: 'INVALID_PROJECT_PAYLOAD',
      message: 'Project API returned an invalid payload',
      errors: [],
    })
  }

  return toProject(payload as unknown as ProjectDto)
}

export async function getProjects(orgId: string): Promise<Project[]> {
  const response = await apiClient.get<ApiSuccessResponse<ProjectDto[] | { items: ProjectDto[] }>>(
    `/admin/orgs/${orgId}/projects`
  )

  return normalizeProjectsPayload(response.data.data)
}

export async function createProject(
  orgId: string,
  data: CreateProjectRequestDto
): Promise<Project> {
  const response = await apiClient.post<ApiSuccessResponse<ProjectDto>>(
    `/admin/orgs/${orgId}/projects`,
    data
  )

  return normalizeProjectPayload(response.data.data)
}

export async function getProject(orgId: string, id: string): Promise<Project> {
  const response = await apiClient.get<ApiSuccessResponse<ProjectDto>>(
    `/admin/orgs/${orgId}/projects/${id}`
  )

  return normalizeProjectPayload(response.data.data)
}

export async function getProjectRunCount(projectId: string): Promise<number> {
  const response = await apiClient.get<ApiSuccessResponse<unknown>>(`/projects/${projectId}/runs`, {
    params: { page: 1, limit: 1, status: 'IN_PROGRESS' },
  })

  const pagination = isObject(response.data) && isObject(response.data.pagination)
    ? response.data.pagination
    : null

  const total = pagination && typeof pagination.total === 'number' ? pagination.total : undefined
  if (typeof total === 'number') {
    return total
  }

  const payload = response.data.data
  if (Array.isArray(payload)) {
    return payload.length
  }

  if (isObject(payload) && Array.isArray(payload.items)) {
    return payload.items.length
  }

  return 0
}

export async function getProjectDefectCount(projectId: string): Promise<number> {
  try {
    const response = await apiClient.get<ApiSuccessResponse<unknown>>(`/projects/${projectId}/defects`, {
      params: { page: 1, limit: 1, status: 'OPEN' },
    })

    const pagination = isObject(response.data) && isObject(response.data.pagination)
      ? response.data.pagination
      : null

    const total = pagination && typeof pagination.total === 'number' ? pagination.total : undefined
    if (typeof total === 'number') {
      return total
    }

    const payload = response.data.data
    if (Array.isArray(payload)) {
      return payload.length
    }

    if (isObject(payload) && Array.isArray(payload.items)) {
      return payload.items.length
    }
  } catch {
    // Fallback to analytics aggregate when defects endpoint is unavailable
  }

  const dateFrom = '2000-01-01'
  const dateTo = new Date().toISOString().slice(0, 10)

  const response = await apiClient.get<ApiSuccessResponse<unknown>>(
    `/projects/${projectId}/analytics/defect-leakage`,
    { params: { dateFrom, dateTo } }
  )

  const payload = response.data.data
  if (!Array.isArray(payload)) {
    return 0
  }

  return payload.reduce((sum, item) => {
    if (isObject(item) && typeof item.total === 'number') {
      return sum + item.total
    }

    if (
      isObject(item) &&
      typeof item.foundInProd === 'number' &&
      typeof item.foundInTesting === 'number'
    ) {
      return sum + item.foundInProd + item.foundInTesting
    }

    return sum
  }, 0)
}
