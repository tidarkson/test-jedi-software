'use client'

import * as React from 'react'
import Link from 'next/link'
import { subDays } from 'date-fns'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, PlayCircle, Clock, CheckCircle2, XCircle, Pause } from 'lucide-react'
import { format } from 'date-fns'
import { getRunMetrics, getRuns } from '@/lib/api/runs'
import type { BackendRunStatus, RunDto, RunMetricsResponse } from '@/lib/api/types/runs'
import { useProjectStore } from '@/lib/store/project-store'
import { toast } from 'sonner'

interface RunListItem {
  run: RunDto
  metrics: RunMetricsResponse
}

const statusConfig = {
  OPEN: { label: 'Scheduled', icon: Clock, className: 'bg-blue-100 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'In Progress', icon: PlayCircle, className: 'bg-amber-100 text-amber-700 border-amber-200' },
  CLOSED: { label: 'Closed', icon: CheckCircle2, className: 'bg-green-100 text-green-700 border-green-200' },
  COMPLETED: { label: 'Closed', icon: CheckCircle2, className: 'bg-green-100 text-green-700 border-green-200' },
  paused: { label: 'Paused', icon: Pause, className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
}

export default function TestRunsPage() {
  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const [runs, setRuns] = React.useState<RunListItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState<'all' | BackendRunStatus>('all')
  const [environmentFilter, setEnvironmentFilter] = React.useState<string>('all')

  React.useEffect(() => {
    async function loadRuns() {
      if (!currentProjectId) {
        setRuns([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const runDtos = await getRuns(currentProjectId, {
          ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
          ...(environmentFilter !== 'all' ? { environment: environmentFilter } : {}),
        })
        const metricsList = await Promise.all(
          runDtos.map(async (run) => {
            try {
              return await getRunMetrics(run.id)
            } catch {
              return {
                totalCases: 0,
                passedCases: 0,
                failedCases: 0,
                blockedCases: 0,
                skippedCases: 0,
                notRunCases: 0,
                inProgressCases: 0,
                passRate: 0,
                failRate: 0,
                completionRate: 0,
                defectCount: 0,
                flakyTests: [],
                estimatedTime: 0,
                actualTime: 0,
                testerPerformance: [],
              }
            }
          })
        )

        setRuns(runDtos.map((run, index) => ({ run, metrics: metricsList[index] })))
      } catch {
        toast.error('Failed to load test runs')
        setRuns([])
      } finally {
        setIsLoading(false)
      }
    }

    void loadRuns()
  }, [currentProjectId, statusFilter, environmentFilter])

  const sevenDaysAgo = subDays(new Date(), 7)
  const activeRuns = runs.filter(({ run }) => run.status === 'OPEN' || run.status === 'IN_PROGRESS').length
  const completedThisWeek = runs.filter(({ run }) => {
    if (!run.completedAt) {
      return false
    }

    return new Date(run.completedAt) >= sevenDaysAgo
  }).length
  const failedCasesAcrossActiveRuns = runs
    .filter(({ run }) => run.status === 'OPEN' || run.status === 'IN_PROGRESS')
    .reduce((sum, item) => sum + item.metrics.failedCases, 0)

  const breadcrumbs = [
    { title: 'Test Management', href: '#' },
    { title: 'Test Runs' },
  ]

  return (
    <AppShell
      sidebar={<Sidebar />}
      header={<Header breadcrumbs={breadcrumbs} />}
    >
      <div className="h-full overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Test Runs</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track your test execution runs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | BackendRunStatus)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value="Staging">Staging</SelectItem>
                <SelectItem value="Production">Production</SelectItem>
                <SelectItem value="QA">QA</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
              </SelectContent>
            </Select>

            <Button asChild>
              <Link href="/test-runs/new">
                <Plus className="mr-2 h-4 w-4" />
                New Test Run
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Runs</CardDescription>
              <CardTitle className="text-3xl">{activeRuns}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <PlayCircle className="h-4 w-4 text-blue-500" />
                Currently in progress
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed This Week</CardDescription>
              <CardTitle className="text-3xl">{completedThisWeek}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Runs closed in last 7 days
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Failed Cases</CardDescription>
              <CardTitle className="text-3xl">{failedCasesAcrossActiveRuns}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <XCircle className="h-4 w-4 text-red-500" />
                Across all active runs
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Runs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Results</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Loading test runs...
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && runs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No test runs found for the current project.
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading && runs.map(({ run, metrics }) => {
                  const status = statusConfig[run.status] ?? statusConfig.paused
                  const StatusIcon = status.icon
                  const completed =
                    metrics.passedCases +
                    metrics.failedCases +
                    metrics.blockedCases +
                    metrics.skippedCases
                  const progressPercent = metrics.totalCases > 0
                    ? Math.round((completed / metrics.totalCases) * 100)
                    : 0

                  return (
                    <TableRow key={run.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link href={`/test-runs/${run.id}`} className="block">
                          <p className="font-medium hover:underline">{run.name}</p>
                          <p className="text-xs text-muted-foreground">{run.id}</p>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={status.className}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{run.environment}</TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="mb-1 flex justify-between text-xs">
                            <span>{progressPercent}%</span>
                            <span className="text-muted-foreground">
                              {completed}/{metrics.totalCases}
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-600">{metrics.passedCases} passed</span>
                          <span className="text-red-600">{metrics.failedCases} failed</span>
                          {metrics.blockedCases > 0 && (
                            <span className="text-orange-600">{metrics.blockedCases} blocked</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {run.startedAt ? format(new Date(run.startedAt), 'MMM d, yyyy') : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/execute?runId=${run.id}`}>
                            Execute
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
