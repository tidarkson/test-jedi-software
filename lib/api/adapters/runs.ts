import type {
  RunDto,
  RunCaseDto,
  RunMetricsResponse,
  BackendRunStatus,
} from '@/lib/api/types/runs'
import type {
  RunDashboardData,
  RunMetrics,
  RunStatus,
  TestStatus,
  TesterPerformance,
} from '@/types'
import type { ExecutionCase } from '@/types/execution'

function toDate(value?: string | null): Date | undefined {
  if (!value) {
    return undefined
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function backendRunStatusToFrontend(status: BackendRunStatus): RunStatus {
  switch (status) {
    case 'OPEN':
      return 'scheduled'
    case 'IN_PROGRESS':
      return 'in_progress'
    case 'CLOSED':
    case 'COMPLETED':
      return 'closed'
    default:
      return 'paused'
  }
}

function runCaseBackendStatusToExecutionStatus(status: string): TestStatus | 'pending' {
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
      return 'pending'
    default:
      return 'pending'
  }
}

export function runStatusToBackend(status: TestStatus): string {
  return status.replace(/-/g, '_').toUpperCase()
}

export function backendStatusToFrontend(status: string): TestStatus {
  switch (status) {
    case 'PASSED':
      return 'passed'
    case 'FAILED':
      return 'failed'
    case 'BLOCKED':
      return 'blocked'
    case 'SKIPPED':
      return 'skipped'
    case 'NOT_RUN':
      return 'na'
    case 'IN_PROGRESS':
      return 'retest'
    default:
      return 'deferred'
  }
}

export function mapRunMetricsResponse(metrics?: RunMetricsResponse): RunMetrics {
  if (!metrics) {
    return {
      totalCases: 0,
      completedCases: 0,
      remainingCases: 0,
      passRate: 0,
      failRate: 0,
      estimatedTime: 0,
      actualTime: 0,
      defectCount: 0,
      riskScore: 'low',
      statusDistribution: {
        passed: 0,
        failed: 0,
        blocked: 0,
        retest: 0,
        skipped: 0,
        untested: 0,
      },
    }
  }

  const completedCases =
    metrics.passedCases +
    metrics.failedCases +
    metrics.blockedCases +
    metrics.skippedCases

  return {
    totalCases: metrics.totalCases,
    completedCases,
    remainingCases: Math.max(0, metrics.totalCases - completedCases),
    passRate: metrics.passRate,
    failRate: metrics.failRate,
    estimatedTime: metrics.estimatedTime,
    actualTime: metrics.actualTime,
    defectCount: metrics.defectCount,
    riskScore: metrics.failRate >= 50 ? 'critical' : metrics.failRate >= 30 ? 'high' : metrics.failRate >= 15 ? 'medium' : 'low',
    statusDistribution: {
      passed: metrics.passedCases,
      failed: metrics.failedCases,
      blocked: metrics.blockedCases,
      retest: metrics.inProgressCases,
      skipped: metrics.skippedCases,
      untested: metrics.notRunCases,
    },
  }
}

function mapTesterPerformance(metrics?: RunMetricsResponse): TesterPerformance[] {
  if (!metrics) {
    return []
  }

  return metrics.testerPerformance.map((tester) => ({
    id: tester.testerId,
    name: tester.testerName,
    assigned: tester.casesHandled,
    completed: tester.casesHandled,
    passRate: tester.passRate,
    avgTimePerCase: tester.averageTimePerCase,
    avatar: tester.testerName.charAt(0).toUpperCase(),
  }))
}

export function runDtoToRunDashboardData(
  dto: RunDto,
  metrics?: RunMetricsResponse
): RunDashboardData {
  const createdAt = toDate(dto.startedAt) ?? toDate(dto.createdAt) ?? new Date()
  const updatedAt = toDate(dto.updatedAt) ?? toDate(dto.completedAt) ?? new Date()

  return {
    id: dto.id,
    title: dto.name,
    environment: dto.environment || 'N/A',
    buildNumber: dto.buildNumber ?? 'N/A',
    branch: dto.branch ?? undefined,
    status: backendRunStatusToFrontend(dto.status),
    dueDate: toDate(dto.dueDate),
    metrics: mapRunMetricsResponse(metrics),
    testerPerformance: mapTesterPerformance(metrics),
    failureDistribution: [],
    activityFeed: [],
    createdBy: {
      id: 'system',
      name: 'System',
      email: 'system@test-jedi.local',
      role: 'manager',
    },
    createdAt,
    updatedAt,
  }
}

export function runCaseStatusAdapter(cases: RunCaseDto[]): ExecutionCase[] {
  return cases.map((runCase) => ({
    id: runCase.id,
    caseId: runCase.caseId,
    caseTitle: runCase.testCase?.title ?? `Case ${runCase.caseId.slice(0, 8)}`,
    suiteName: 'General',
    suiteId: 'general',
    priority: 'medium',
    status: runCaseBackendStatusToExecutionStatus(runCase.status),
    assignee: runCase.assignee
      ? {
          id: runCase.assignee.id,
          name: runCase.assignee.name,
          email: runCase.assignee.email,
          role: 'engineer',
        }
      : undefined,
    steps: (runCase.stepResults ?? []).map((step, index) => ({
      stepId: step.stepId,
      stepNumber: index + 1,
      action: 'Step execution',
      expectedResult: 'Expected result',
      status: runCaseBackendStatusToExecutionStatus(step.status),
      comment: step.comment ?? undefined,
    })),
    defectId: undefined,
    estimatedTime: runCase.testCase?.estimatedTime ?? undefined,
    startedAt: toDate(runCase.startedAt),
    completedAt: toDate(runCase.completedAt),
    lastSavedAt: toDate(runCase.completedAt) ?? toDate(runCase.startedAt),
  }))
}
