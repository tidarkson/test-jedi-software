export type BackendPlanStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'ARCHIVED'
  | string

export interface PlanDto {
  id: string
  projectId: string
  title?: string
  name?: string
  description?: string | null
  status: BackendPlanStatus
  approvedById?: string | null
  approvedBy?:
    | {
        id: string
        name?: string
        email?: string
      }
    | null
  approvedAt?: string | Date | null
  milestoneId?: string | null
  milestone?:
    | {
        id: string
        name: string
        dueDate?: string | Date | null
      }
    | null
  linkedRuns?: PlanRunDto[]
  metrics?: PlanMetricsDto
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface PlanCreateRequest {
  name: string
  description?: string
  milestoneId?: string
  runIds?: string[]
}

export interface PlanUpdateRequest {
  name?: string
  description?: string
  milestoneId?: string | null
  status?: 'draft' | 'pending_approval' | 'approved' | 'deprecated'
}

export interface PlanApproveRequest {
  comment?: string
}

export interface PlanMetricsDto {
  totalCases?: number
  passedCases?: number
  failedCases?: number
  blockedCases?: number
  skippedCases?: number
  notRunCases?: number
  inProgressCases?: number
  passRate?: number
  completionRate?: number
  openDefectCount?: number
  releaseReadinessScore?: number
  linkedRunCount?: number
  averageCaseExecutionTime?: number
}

export interface PlanReadinessResponse {
  score: number
  components?: {
    passRateScore?: number
    completionScore?: number
    defectScore?: number
    coverageScore?: number
  }
  weights?: {
    passRate?: number
    completion?: number
    defects?: number
    coverage?: number
  }
  recommendation?: 'ready' | 'ready-with-risks' | 'not-ready'
  risks?: string[]
  breakdown?: Record<string, number>
}

export interface PlanRunDto {
  id?: string
  runId: string
  title?: string
  name?: string
  status?: string
  metrics?: {
    totalCases?: number
    passedCases?: number
    failedCases?: number
    passRate?: number
    completionRate?: number
  }
}

export interface PlanVersionDto {
  id: string
  planId?: string
  versionNum?: number
  version?: number
  snapshot?: {
    title?: string
    description?: string | null
    status?: string
    linkedRunIds?: string[]
    metrics?: PlanMetricsDto
    timestamp?: string
  }
  isBaseline?: boolean
  createdAt?: string | Date
}
