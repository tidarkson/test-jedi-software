'use client'

import * as React from 'react'
import { format, subDays } from 'date-fns'
import { Bug, ExternalLink, AlertTriangle, CheckCircle2, Link2, AlertCircle } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useProjectStore } from '@/lib/store/project-store'
import { useDefectsStore } from '@/lib/store/defects-store'
import { useIntegrationStore } from '@/lib/store/integration-store'
import type { DefectRecord, DefectSeverity, DefectStatus } from '@/lib/api/types/defects'

// ---------------------------------------------------------------------------
// Severity badge
// ---------------------------------------------------------------------------
const severityConfig: Record<DefectSeverity, { label: string; className: string }> = {
  blocker: { label: 'Blocker', className: 'bg-red-100 text-red-800 border-red-200' },
  critical: { label: 'Critical', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  major: { label: 'Major', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  minor: { label: 'Minor', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  trivial: { label: 'Trivial', className: 'bg-gray-100 text-gray-700 border-gray-200' },
}

function SeverityBadge({ severity }: { severity: DefectSeverity }) {
  const cfg = severityConfig[severity] ?? severityConfig.major
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}

function StatusBadge({ status }: { status: DefectStatus }) {
  if (status === 'open') {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        Open
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
      Resolved
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Skeleton rows while loading
// ---------------------------------------------------------------------------
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function DefectsPage() {
  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const { defects, isLoading, error, stats, loadDefects } = useDefectsStore()
  const integrations = useIntegrationStore((state) => state.integrations)
  const loadIntegrations = useIntegrationStore((state) => state.loadIntegrations)

  // Filters
  const [runFilter, setRunFilter] = React.useState<string>('all')
  const [severityFilter, setSeverityFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')

  // Load data on mount / project change
  React.useEffect(() => {
    if (!currentProjectId) return
    void loadDefects(currentProjectId)
    void loadIntegrations(currentProjectId)
  }, [currentProjectId, loadDefects, loadIntegrations])

  // Jira instance URL for deep-linking
  const jiraIntegration = integrations.find((i) => i.type === 'jira' && i.status === 'connected')
  const jiraInstanceUrl = (jiraIntegration?.config as { instanceUrl?: string } | undefined)
    ?.instanceUrl

  // Build run list for filter dropdown
  const uniqueRuns = React.useMemo<{ id: string; name: string }[]>(() => {
    const seen = new Map<string, string>()
    for (const d of defects) {
      if (!seen.has(d.runId)) seen.set(d.runId, d.runName)
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [defects])

  // Apply filters
  const filtered = React.useMemo<DefectRecord[]>(() => {
    return defects.filter((d) => {
      if (runFilter !== 'all' && d.runId !== runFilter) return false
      if (severityFilter !== 'all' && d.severity !== severityFilter) return false
      if (statusFilter !== 'all' && d.status !== statusFilter) return false
      return true
    })
  }, [defects, runFilter, severityFilter, statusFilter])

  // Summary card stats
  const sevenDaysAgo = subDays(new Date(), 7)
  const resolvedThisWeek = defects.filter(
    (d) => d.status === 'resolved' && new Date(d.createdAt) >= sevenDaysAgo
  ).length
  const linkedToJira = defects.filter((d) => !!d.defectId).length
  const criticalBlockerCount = defects.filter(
    (d) => d.status === 'open' && (d.severity === 'critical' || d.severity === 'blocker')
  ).length

  const breadcrumbs = [
    { title: 'Test Management', href: '#' },
    { title: 'Defects' },
  ]

  return (
    <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
      <div className="h-full overflow-auto p-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Bug className="h-6 w-6" />
            Defects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregated defects from failed test run cases
          </p>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Total Open
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold text-red-600">{stats.open}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Resolved This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold text-green-600">{resolvedThisWeek}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Link2 className="h-4 w-4 text-blue-500" />
                Linked to Jira
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold">{linkedToJira}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Critical / Blocker
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-3xl font-bold text-orange-600">{criticalBlockerCount}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Select value={runFilter} onValueChange={setRunFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by run" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Runs</SelectItem>
              {uniqueRuns.map((run) => (
                <SelectItem key={run.id} value={run.id}>
                  {run.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="blocker">Blocker</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="major">Major</SelectItem>
              <SelectItem value="minor">Minor</SelectItem>
              <SelectItem value="trivial">Trivial</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error state */}
        {error && !isLoading && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* No project selected */}
        {!currentProjectId && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <Bug className="mb-3 h-10 w-10 opacity-30" />
            <p className="font-medium">No project selected</p>
            <p className="text-sm">Select a project from the top bar to view defects.</p>
          </div>
        )}

        {/* Defects table */}
        {currentProjectId && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Case Title</TableHead>
                  <TableHead>Run Name</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>External ID</TableHead>
                  <TableHead className="w-[130px]">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton />
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                      <Bug className="mx-auto mb-2 h-8 w-8 opacity-30" />
                      <p>No defects found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((defect) => (
                    <TableRow key={defect.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {defect.runCaseId.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{defect.caseTitle}</div>
                        {defect.suiteName && (
                          <div className="text-xs text-muted-foreground">{defect.suiteName}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{defect.runName}</TableCell>
                      <TableCell>
                        <SeverityBadge severity={defect.severity} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={defect.status} />
                      </TableCell>
                      <TableCell>
                        {defect.defectId ? (
                          jiraInstanceUrl ? (
                            <a
                              href={`${jiraInstanceUrl}/browse/${defect.defectId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                            >
                              {defect.defectId}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-sm font-medium">{defect.defectId}</span>
                          )
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(defect.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppShell>
  )
}
