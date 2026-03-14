import type { RunCaseDto, RunCaseUpdateRequest } from '@/lib/api/types/runs'
import type { TestStatus, User } from '@/types'
import type { ExecutionCase, ExecutionStepResult } from '@/types/execution'

function toDate(value?: string | null): Date | undefined {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function backendStatusToExecutionStatus(status: RunCaseDto['status']): TestStatus | 'pending' {
  switch (status) {
    case 'PASSED':
      return 'passed'
    case 'FAILED':
      return 'failed'
    case 'BLOCKED':
      return 'blocked'
    case 'SKIPPED':
      return 'skipped'
    case 'IN_PROGRESS':
      return 'retest'
    case 'NOT_RUN':
    case 'IDLE':
    case 'INCOMPLETE':
    default:
      return 'pending'
  }
}

function executionStatusToBackendStatus(status: TestStatus | 'pending'): RunCaseUpdateRequest['status'] {
  switch (status) {
    case 'passed':
      return 'PASSED'
    case 'failed':
      return 'FAILED'
    case 'blocked':
      return 'BLOCKED'
    case 'skipped':
      return 'SKIPPED'
    case 'pending':
    case 'retest':
    case 'na':
    case 'deferred':
    default:
      return 'NOT_RUN'
  }
}

export function runCaseDtoToExecutionCase(dto: RunCaseDto): ExecutionCase {
  const assignee: User | undefined = dto.assignee
    ? {
        id: dto.assignee.id,
        name: dto.assignee.name,
        email: dto.assignee.email,
        role: 'engineer',
      }
    : undefined

  return {
    id: dto.id,
    caseId: dto.caseId,
    caseTitle: dto.testCase?.title ?? `Case ${dto.caseId.slice(0, 8)}`,
    suiteName: 'General',
    suiteId: 'general',
    priority: 'medium',
    status: backendStatusToExecutionStatus(dto.status),
    assignee,
    steps: (dto.stepResults ?? []).map((step, index) => ({
      stepId: step.stepId,
      stepNumber: index + 1,
      action: `Step ${index + 1}`,
      expectedResult: 'Expected result',
      status: backendStatusToExecutionStatus(step.status),
      comment: step.comment ?? undefined,
    })),
    estimatedTime: dto.testCase?.estimatedTime ?? undefined,
    startedAt: toDate(dto.startedAt),
    completedAt: toDate(dto.completedAt),
    lastSavedAt: toDate(dto.completedAt) ?? toDate(dto.startedAt),
  }
}

export function stepResultToUpdateRequest(result: ExecutionStepResult): RunCaseUpdateRequest {
  return {
    status: executionStatusToBackendStatus(result.status),
    comment: result.comment,
    actualResult: result.actualResult,
  }
}
