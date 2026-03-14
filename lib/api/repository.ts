import apiClient from './client'
import {
  buildSuiteTree,
  caseDtoToItem,
  suiteDtoToNode,
} from './adapters/repository'
import type { ApiSuccessResponse } from './types/common'
import type {
  BulkCaseOperationRequest,
  CaseHistoryEntryDto,
  ImportRepositoryRequest,
  ImportRepositoryResult,
  RepositoryImportExportPayload,
  SuiteCreateRequest,
  SuiteDto,
  SuiteUpdateRequest,
  TestCaseAutomationStatusDto,
  TestCaseCreateRequest,
  TestCaseDto,
  TestCasePriorityDto,
  TestCaseSeverityDto,
  TestCaseTypeDto,
  TestCaseUpdateRequest,
} from './types/repository'
import type { TestCaseItem, TestSuiteNode } from '@/lib/store/test-repository-store'

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

export interface GetCasesFilters {
  suiteId?: string
  priority?: TestCaseItem['priority'] | TestCaseItem['priority'][]
  severity?: TestCaseItem['severity'] | TestCaseItem['severity'][]
  type?: TestCaseItem['type'] | TestCaseItem['type'][]
  automationStatus?: TestCaseItem['automationStatus'] | TestCaseItem['automationStatus'][]
  status?: string | string[]
  tags?: string[]
  search?: string
  cursor?: string
  page?: number
  limit?: number
}

function toApiEnum(value: string): string {
  if (value === 'to-automate') {
    return 'PENDING_AUTOMATION'
  }

  if (value === 'partially-automated') {
    return 'PARTIALLY_AUTOMATED'
  }

  return value.replace(/-/g, '_').toUpperCase()
}

function normalizeEnumFilter<TDto extends string>(value?: string | string[]): TDto | TDto[] | undefined {
  if (!value) {
    return undefined
  }

  if (Array.isArray(value)) {
    return value.map((entry) => toApiEnum(entry) as TDto)
  }

  return toApiEnum(value) as TDto
}

function buildCaseQueryParams(filters?: GetCasesFilters): Record<string, string | number | string[] | undefined> {
  if (!filters) {
    return {}
  }

  return {
    suiteId: filters.suiteId,
    priority: normalizeEnumFilter<TestCasePriorityDto>(filters.priority),
    severity: normalizeEnumFilter<TestCaseSeverityDto>(filters.severity),
    type: normalizeEnumFilter<TestCaseTypeDto>(filters.type),
    automationStatus: normalizeEnumFilter<TestCaseAutomationStatusDto>(filters.automationStatus),
    status: normalizeEnumFilter<string>(filters.status),
    tags: filters.tags,
    search: filters.search,
    cursor: filters.cursor,
    page: filters.page,
    limit: filters.limit,
  }
}

export async function getSuites(projectId: string): Promise<TestSuiteNode[]> {
  const response = await apiClient.get<ApiSuccessResponse<SuiteDto[]>>(`/projects/${projectId}/suites`)
  return buildSuiteTree(response.data.data.map(suiteDtoToNode))
}

export async function createSuite(
  projectId: string,
  data: SuiteCreateRequest
): Promise<TestSuiteNode> {
  const response = await apiClient.post<ApiSuccessResponse<SuiteDto>>(
    `/projects/${projectId}/suites`,
    data
  )

  return suiteDtoToNode(response.data.data)
}

export async function updateSuite(
  projectId: string,
  id: string,
  data: SuiteUpdateRequest
): Promise<TestSuiteNode> {
  const response = await apiClient.put<ApiSuccessResponse<SuiteDto>>(
    `/projects/${projectId}/suites/${id}`,
    data
  )

  return suiteDtoToNode(response.data.data)
}

export async function deleteSuite(projectId: string, id: string): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(`/projects/${projectId}/suites/${id}`)
}

export async function cloneSuite(projectId: string, id: string): Promise<TestSuiteNode> {
  const response = await apiClient.post<ApiSuccessResponse<SuiteDto>>(
    `/projects/${projectId}/suites/${id}/clone`
  )

  return suiteDtoToNode(response.data.data)
}

export async function lockSuite(projectId: string, id: string): Promise<void> {
  await apiClient.post<ApiSuccessResponse<SuiteDto>>(`/projects/${projectId}/suites/${id}/lock`)
}

export async function archiveSuite(projectId: string, id: string): Promise<void> {
  await apiClient.post<ApiSuccessResponse<SuiteDto>>(`/projects/${projectId}/suites/${id}/archive`)
}

export async function getCases(
  projectId: string,
  filters?: GetCasesFilters
): Promise<TestCaseItem[]> {
  const response = await apiClient.get<PaginatedApiSuccessResponse<TestCaseDto[]>>(
    `/projects/${projectId}/cases`,
    {
      params: buildCaseQueryParams(filters),
    }
  )

  return response.data.data.map(caseDtoToItem)
}

export async function getCase(projectId: string, id: string): Promise<TestCaseItem> {
  const response = await apiClient.get<ApiSuccessResponse<TestCaseDto>>(`/projects/${projectId}/cases/${id}`)
  return caseDtoToItem(response.data.data)
}

export async function createCase(
  projectId: string,
  data: TestCaseCreateRequest
): Promise<TestCaseItem> {
  const response = await apiClient.post<ApiSuccessResponse<TestCaseDto>>(
    `/projects/${projectId}/cases`,
    data
  )

  return caseDtoToItem(response.data.data)
}

export async function updateCase(
  projectId: string,
  id: string,
  data: TestCaseUpdateRequest
): Promise<TestCaseItem> {
  const response = await apiClient.put<ApiSuccessResponse<TestCaseDto>>(
    `/projects/${projectId}/cases/${id}`,
    data
  )

  return caseDtoToItem(response.data.data)
}

export async function deleteCase(projectId: string, id: string): Promise<void> {
  await apiClient.delete<ApiSuccessResponse<Record<string, never>>>(`/projects/${projectId}/cases/${id}`)
}

export async function bulkCaseOperation(
  projectId: string,
  data: BulkCaseOperationRequest
): Promise<void> {
  await apiClient.post<ApiSuccessResponse<Record<string, never>>>(`/projects/${projectId}/cases/bulk`, data)
}

export async function getCaseHistory(
  projectId: string,
  id: string
): Promise<CaseHistoryEntryDto[]> {
  const response = await apiClient.get<ApiSuccessResponse<CaseHistoryEntryDto[]>>(
    `/projects/${projectId}/cases/${id}/history`
  )

  return response.data.data
}

export async function exportRepository(
  projectId: string,
  suiteId?: string
): Promise<RepositoryImportExportPayload> {
  const response = await apiClient.get<ApiSuccessResponse<RepositoryImportExportPayload>>(
    `/projects/${projectId}/repository/export`,
    {
      params: {
        suiteId,
      },
    }
  )

  return response.data.data
}

export async function importRepository(
  projectId: string,
  payload: ImportRepositoryRequest
): Promise<ImportRepositoryResult> {
  const response = await apiClient.post<ApiSuccessResponse<ImportRepositoryResult>>(
    `/projects/${projectId}/repository/import`,
    payload
  )

  return response.data.data
}
