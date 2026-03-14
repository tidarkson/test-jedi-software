import type { ExecutionCase } from '@/types/execution'

export type BackendRunStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'COMPLETED'
export type BackendRunType = 'MANUAL' | 'AUTOMATED' | 'HYBRID'
export type BackendRunCaseStatus =
  | 'IDLE'
  | 'IN_PROGRESS'
  | 'PASSED'
  | 'FAILED'
  | 'BLOCKED'
  | 'SKIPPED'
  | 'NOT_RUN'
  | 'INCOMPLETE'

export interface RunDto {
  id: string
  projectId: string
  name: string
  status: BackendRunStatus
  type: BackendRunType
  environment: string
  startedAt: string | null
  completedAt: string | null
  buildNumber?: string | null
  branch?: string | null
  dueDate?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface RunCreateRequest {
  title: string
  type: 'MANUAL' | 'AUTOMATED' | 'HYBRID'
  environment?: string
  plannedStart?: string
  dueDate?: string
  milestoneId?: string
  buildNumber?: string
  branch?: string
  defaultAssigneeId?: string
  caseSelection: {
    suiteIds?: string[]
    caseIds?: string[]
    queryFilters?: {
      priority?: string
      type?: string
      status?: string
      automationStatus?: string
    }
    excludeIds?: string[]
  }
}

export interface RunCaseUpdateRequest {
  status: 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED' | 'NOT_RUN'
  comment?: string
  defectId?: string
  actualResult?: string
}

export interface RunCaseDto {
  id: string
  runId: string
  caseId: string
  status: BackendRunCaseStatus
  startedAt: string | null
  completedAt: string | null
  assigneeId?: string | null
  assignee?: {
    id: string
    name: string
    email: string
  }
  testCase?: {
    id: string
    title: string
    estimatedTime: number | null
  }
  stepResults?: Array<{
    id: string
    stepId: string
    status: BackendRunCaseStatus
    comment: string | null
  }>
}

export interface RunMetricsResponse {
  totalCases: number
  passedCases: number
  failedCases: number
  blockedCases: number
  skippedCases: number
  notRunCases: number
  inProgressCases: number
  passRate: number
  failRate: number
  completionRate: number
  defectCount: number
  flakyTests: string[]
  estimatedTime: number
  actualTime: number
  testerPerformance: Array<{
    testerName: string
    testerId: string
    casesHandled: number
    passed: number
    failed: number
    blocked: number
    passRate: number
    averageTimePerCase: number
  }>
}

export interface RunListFilters {
  status?: BackendRunStatus
  type?: BackendRunType
  environment?: string
  milestoneId?: string
  buildNumber?: string
  sort?: string
  cursor?: string
  page?: number
  limit?: number
}

export interface RunPreviewRequest {
  suiteIds?: string[]
  caseIds?: string[]
  excludeIds?: string[]
  filters?: {
    priority?: string
    type?: string
    status?: string
    automationStatus?: string
  }
}

export interface RunPreviewResponse {
  count: number
  estimatedMinutes: number
  selectedCaseIds?: string[]
}

export interface BulkRunCaseStatusUpdateRequest {
  caseIds: string[]
  status: RunCaseUpdateRequest['status']
}

export interface RunDetailResponse {
  run: RunDto
  metrics: RunMetricsResponse
  cases: ExecutionCase[]
}
