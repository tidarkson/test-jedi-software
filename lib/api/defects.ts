import apiClient from './client'
import { getRuns } from './runs'
import type { ApiSuccessResponse } from './types/common'
import type { DefectRecord, DefectSeverity } from './types/defects'

// ---------------------------------------------------------------------------
// Extended run-case shape returned by the backend (includes fields not yet
// present in the shared RunCaseDto frontend type)
// ---------------------------------------------------------------------------
interface RawRunCaseExtended {
  id: string
  runId: string
  caseId: string
  status: string
  defectId?: string | null
  createdAt?: string | null
  startedAt?: string | null
  assigneeId?: string | null
  assignee?: {
    id: string
    name: string
    email?: string
  } | null
  testCase?: {
    id: string
    title: string
    estimatedTime: number | null
    priority?: string
    suite?: { id: string; name: string }
  } | null
}

// ---------------------------------------------------------------------------
// Simple in-memory cache (2-minute TTL)
// ---------------------------------------------------------------------------
interface CacheEntry {
  projectId: string
  data: DefectRecord[]
  fetchedAt: number
}

const CACHE_TTL_MS = 2 * 60 * 1000
let defectsCache: CacheEntry | null = null

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function priorityToSeverity(priority?: string | null): DefectSeverity {
  switch (priority?.toUpperCase()) {
    case 'BLOCKER':
      return 'blocker'
    case 'CRITICAL':
      return 'critical'
    case 'HIGH':
      return 'major'
    case 'MEDIUM':
      return 'minor'
    case 'LOW':
      return 'trivial'
    default:
      return 'major'
  }
}

async function fetchRunCasesRaw(runId: string): Promise<RawRunCaseExtended[]> {
  const response = await apiClient.get<ApiSuccessResponse<RawRunCaseExtended[]>>(
    `/runs/${runId}/cases`
  )
  const payload = response.data.data
  return Array.isArray(payload) ? payload : []
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Aggregates defect records for a project by iterating over all active runs
 * (OPEN / IN_PROGRESS) and collecting run-cases that have an external defect ID.
 *
 * Results are cached for {@link CACHE_TTL_MS} ms to reduce API calls.
 */
export async function getDefectsSummary(projectId: string): Promise<DefectRecord[]> {
  const now = Date.now()

  if (
    defectsCache &&
    defectsCache.projectId === projectId &&
    now - defectsCache.fetchedAt < CACHE_TTL_MS
  ) {
    return defectsCache.data
  }

  const runs = await getRuns(projectId)
  const activeRuns = runs.filter(
    (run) => run.status === 'OPEN' || run.status === 'IN_PROGRESS'
  )

  const runCasesResults = await Promise.allSettled(
    activeRuns.map(async (run) => {
      const cases = await fetchRunCasesRaw(run.id)
      return { run, cases }
    })
  )

  const defects: DefectRecord[] = []

  for (const result of runCasesResults) {
    if (result.status !== 'fulfilled') continue

    const { run, cases } = result.value

    for (const rawCase of cases) {
      if (!rawCase.defectId) continue

      const status = rawCase.status === 'FAILED' ? 'open' : 'resolved'

      defects.push({
        id: rawCase.id,
        runCaseId: rawCase.id,
        runId: run.id,
        runName: run.name,
        caseTitle: rawCase.testCase?.title ?? rawCase.caseId,
        suiteName: rawCase.testCase?.suite?.name,
        defectId: rawCase.defectId,
        severity: priorityToSeverity(rawCase.testCase?.priority),
        status,
        createdAt: rawCase.createdAt ?? rawCase.startedAt ?? new Date().toISOString(),
        assignee: rawCase.assignee
          ? {
              id: rawCase.assignee.id,
              name: rawCase.assignee.name,
              email: rawCase.assignee.email,
            }
          : undefined,
      })
    }
  }

  defectsCache = { projectId, data: defects, fetchedAt: now }
  return defects
}

/** Force the next call to {@link getDefectsSummary} to bypass the cache. */
export function invalidateDefectsCache(): void {
  defectsCache = null
}
