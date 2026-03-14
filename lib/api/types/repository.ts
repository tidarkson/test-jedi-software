export type SuiteStatusDto = 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'DEPRECATED'

export type TestCasePriorityDto = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type TestCaseSeverityDto = 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL'

export type TestCaseTypeDto =
  | 'FUNCTIONAL'
  | 'REGRESSION'
  | 'SMOKE'
  | 'INTEGRATION'
  | 'E2E'
  | 'PERFORMANCE'
  | 'SECURITY'
  | 'USABILITY'

export type TestCaseAutomationStatusDto =
  | 'MANUAL'
  | 'AUTOMATED'
  | 'PARTIALLY_AUTOMATED'
  | 'PENDING_AUTOMATION'

export interface SuiteDto {
  id: string
  projectId: string
  name: string
  description?: string | null
  parentSuiteId: string | null
  orderIndex: number
  isLocked: boolean
  isArchived: boolean
  caseCount: number
}

export interface SuiteCreateRequest {
  name: string
  description?: string
  parentSuiteId?: string | null
}

export interface SuiteUpdateRequest {
  name?: string
  description?: string
  parentSuiteId?: string | null
  isLocked?: boolean
  isArchived?: boolean
}

export interface TestCaseStepRequest {
  action: string
  expectedResult: string
  order?: number
}

export interface TestCaseDto {
  id: string
  suiteId: string
  title: string
  description?: string | null
  preconditions?: string | null
  postconditions?: string | null
  priority: TestCasePriorityDto
  severity: TestCaseSeverityDto
  type: TestCaseTypeDto
  automationStatus: TestCaseAutomationStatusDto
  status: SuiteStatusDto
  tags: string[]
  steps: TestCaseStepRequest[]
  estimatedTime?: number | null
}

export interface TestCaseCreateRequest {
  suiteId: string
  title: string
  description?: string
  preconditions?: string
  postconditions?: string
  priority: TestCasePriorityDto
  severity: TestCaseSeverityDto
  type: TestCaseTypeDto
  automationStatus?: TestCaseAutomationStatusDto
  tags?: string[]
  steps?: TestCaseStepRequest[]
  estimatedTime?: number
}

export interface TestCaseUpdateRequest extends Partial<TestCaseCreateRequest> {}

export interface RepositoryExportCase {
  title: string
  description?: string | null
  preconditions?: string | null
  postconditions?: string | null
  priority: TestCasePriorityDto
  severity: TestCaseSeverityDto
  type: TestCaseTypeDto
  automationStatus: TestCaseAutomationStatusDto
  status: SuiteStatusDto
  estimatedTime?: number | null
  tags: string[]
  steps: TestCaseStepRequest[]
}

export interface RepositoryExportSuite {
  name: string
  description?: string | null
  status: SuiteStatusDto
  isLocked: boolean
  cases: RepositoryExportCase[]
  childSuites: RepositoryExportSuite[]
}

export interface RepositoryImportExportPayload {
  version: 1
  exportedAt: string
  projectId: string
  projectName: string
  rootSuites: RepositoryExportSuite[]
}

export interface ImportRepositoryRequest {
  parentSuiteId?: string
  repository: RepositoryImportExportPayload
}

export interface ImportRepositoryResult {
  suitesCreated: number
  casesCreated: number
}

export interface BulkCaseOperationRequest {
  operation: 'move' | 'delete' | 'archive'
  caseIds: string[]
  targetSuiteId?: string
}

export interface CaseHistoryEntryDto {
  changedAt: string
  changedBy: string
  action: string
  changes: unknown
}
