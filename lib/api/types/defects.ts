export type DefectSeverity = 'blocker' | 'critical' | 'major' | 'minor' | 'trivial'

export type DefectStatus = 'open' | 'resolved'

export interface DefectRecord {
  id: string
  runCaseId: string
  runId: string
  runName: string
  caseTitle: string
  suiteName?: string
  /** External issue ID, e.g. a Jira ticket key like "PROJ-123" */
  defectId: string
  severity: DefectSeverity
  status: DefectStatus
  createdAt: string
  assignee?: {
    id: string
    name: string
    email?: string
  }
}
