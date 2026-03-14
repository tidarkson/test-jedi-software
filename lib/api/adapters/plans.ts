import type {
  PlanDto,
  PlanReadinessResponse,
  PlanRunDto,
  PlanVersionDto,
} from '@/lib/api/types/plans'
import type { PlanStatus, ReadinessMetrics, TestPlan, TestRun, User } from '@/types'

const systemUser: User = {
  id: 'system',
  name: 'System',
  email: 'system@test-jedi.local',
  role: 'manager',
}

function toDate(value?: string | Date | null): Date {
  if (!value) {
    return new Date()
  }

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

function backendStatusToPlanStatus(status: string): PlanStatus {
  switch (status?.toUpperCase()) {
    case 'DRAFT':
      return 'draft'
    case 'PENDING_APPROVAL':
      return 'pending_approval'
    case 'APPROVED':
    case 'ACTIVE':
      return 'approved'
    case 'DEPRECATED':
    case 'ARCHIVED':
      return 'deprecated'
    default:
      return 'draft'
  }
}

function backendRunStatusToFrontend(status?: string): TestRun['status'] {
  switch (status?.toUpperCase()) {
    case 'OPEN':
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return 'active'
    case 'ARCHIVED':
      return 'archived'
    default:
      return 'completed'
  }
}

function mapReadinessMetrics(readiness?: PlanReadinessResponse): ReadinessMetrics {
  const passRateWeight = readiness?.weights?.passRate ?? 0.4
  const completionWeight = readiness?.weights?.completion ?? 0.3
  const defectWeight = readiness?.weights?.defects ?? 0.2
  const defectScore = readiness?.components?.defectScore ?? readiness?.breakdown?.defectScore ?? 100

  return {
    passRateWeight,
    passRateScore: readiness?.components?.passRateScore ?? readiness?.breakdown?.passRateScore ?? 0,
    completionWeight,
    completionScore: readiness?.components?.completionScore ?? readiness?.breakdown?.completionScore ?? 0,
    defectWeight,
    defectPenalty: Math.max(0, Math.round((100 - defectScore) / 5)),
    overallScore: readiness?.score ?? 0,
  }
}

function mapLinkedRun(run: PlanRunDto): TestRun {
  const total = run.metrics?.totalCases ?? 0
  const passed = run.metrics?.passedCases ?? 0
  const failed = run.metrics?.failedCases ?? 0

  return {
    id: run.runId,
    name: run.title ?? run.name ?? `Run ${run.runId.slice(0, 8)}`,
    status: backendRunStatusToFrontend(run.status),
    testCases: [],
    environment: 'N/A',
    createdBy: systemUser,
    statistics: {
      total,
      passed,
      failed,
      blocked: 0,
      retest: 0,
      skipped: 0,
      na: 0,
      deferred: 0,
      passRate: run.metrics?.passRate ?? 0,
    },
  }
}

function mapVersions(versions: PlanVersionDto[]) {
  return versions.map((version, index) => ({
    id: version.id,
    version: version.versionNum ?? version.version ?? versions.length - index,
    createdAt: toDate(version.createdAt),
    createdBy: systemUser,
    changes: undefined,
  }))
}

export function planDtoToTestPlan(
  dto: PlanDto,
  readiness?: PlanReadinessResponse,
  runs: PlanRunDto[] = [],
  versions: PlanVersionDto[] = []
): TestPlan {
  const metrics = dto.metrics
  const mappedRuns = runs.map(mapLinkedRun)

  return {
    id: dto.id,
    name: dto.name ?? dto.title ?? `Plan ${dto.id.slice(0, 8)}`,
    description: dto.description ?? undefined,
    version: versions[0]?.versionNum ?? versions[0]?.version ?? 1,
    status: backendStatusToPlanStatus(dto.status),
    milestone: dto.milestone?.name ?? undefined,
    linkedRuns: mappedRuns,
    tags: [],
    readinessScore: readiness?.score ?? metrics?.releaseReadinessScore ?? 0,
    readinessMetrics: mapReadinessMetrics(readiness),
    passRate: metrics?.passRate ?? readiness?.components?.passRateScore ?? 0,
    completionRate: metrics?.completionRate ?? readiness?.components?.completionScore ?? 0,
    openDefects: metrics?.openDefectCount ?? 0,
    totalCases: metrics?.totalCases ?? mappedRuns.reduce((sum, run) => sum + run.statistics.total, 0),
    versions: mapVersions(versions),
    createdAt: toDate(dto.createdAt),
    updatedAt: toDate(dto.updatedAt),
    createdBy: systemUser,
    approvedBy: dto.approvedById || dto.approvedBy
      ? {
          id: dto.approvedBy?.id ?? dto.approvedById ?? 'approver',
          name: dto.approvedBy?.name ?? 'Approver',
          email: dto.approvedBy?.email ?? 'approver@test-jedi.local',
          role: 'manager',
        }
      : undefined,
  }
}
