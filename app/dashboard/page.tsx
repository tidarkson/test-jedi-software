'use client'

import * as React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Files,
  FolderTree,
  FolderKanban,
  PlayCircle,
  Plus,
  RefreshCcw,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { getRunMetrics } from '@/lib/api/runs'
import type { BackendRunStatus, RunMetricsResponse } from '@/lib/api/types/runs'
import { useDashboardStore } from '@/lib/store/dashboard-store'
import { useProjectStore } from '@/lib/store/project-store'

const statusConfig = {
  OPEN: { label: 'Scheduled', icon: Clock, className: 'bg-blue-100 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'In Progress', icon: PlayCircle, className: 'bg-amber-100 text-amber-700 border-amber-200' },
  CLOSED: { label: 'Closed', icon: CheckCircle2, className: 'bg-green-100 text-green-700 border-green-200' },
  COMPLETED: { label: 'Closed', icon: CheckCircle2, className: 'bg-green-100 text-green-700 border-green-200' },
} satisfies Record<BackendRunStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }>

const EMPTY_RUN_METRICS: RunMetricsResponse = {
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

function SummarySkeletons() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="space-y-2 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="mt-3 h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Test Runs</CardTitle>
        <CardDescription>Latest execution activity for the current project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid gap-4 md:grid-cols-[2fr_1fr_1.5fr_1fr_1fr]">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const projects = useProjectStore((state) => state.projects)
  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const isProjectsLoading = useProjectStore((state) => state.isLoading)
  const summary = useDashboardStore((state) => state.summary)
  const recentRuns = useDashboardStore((state) => state.recentRuns)
  const isLoading = useDashboardStore((state) => state.isLoading)
  const error = useDashboardStore((state) => state.error)
  const loadDashboard = useDashboardStore((state) => state.loadDashboard)
  const clearError = useDashboardStore((state) => state.clearError)
  const resetDashboard = useDashboardStore((state) => state.reset)
  const { toast } = useToast()
  const [runMetricsById, setRunMetricsById] = React.useState<Record<string, RunMetricsResponse>>({})
  const [isLoadingRunMetrics, setIsLoadingRunMetrics] = React.useState(false)
  const lastToastMessageRef = React.useRef<string | null>(null)

  const breadcrumbs = [{ title: 'Overview' }, { title: 'Dashboard' }]
  const noProjectSelected = !projects.length || !currentProjectId

  React.useEffect(() => {
    if (!currentProjectId) {
      resetDashboard()
      setRunMetricsById({})
      return
    }

    void loadDashboard(currentProjectId)
  }, [currentProjectId, loadDashboard, resetDashboard])

  React.useEffect(() => {
    let isCancelled = false

    async function loadRunMetrics() {
      if (!currentProjectId || recentRuns.length === 0) {
        setRunMetricsById({})
        setIsLoadingRunMetrics(false)
        return
      }

      setIsLoadingRunMetrics(true)

      try {
        const metricsEntries = await Promise.all(
          recentRuns.map(async (run) => {
            try {
              const metrics = await getRunMetrics(run.id)
              return [run.id, metrics] as const
            } catch {
              return [run.id, EMPTY_RUN_METRICS] as const
            }
          })
        )

        if (!isCancelled) {
          setRunMetricsById(Object.fromEntries(metricsEntries))
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRunMetrics(false)
        }
      }
    }

    void loadRunMetrics()

    return () => {
      isCancelled = true
    }
  }, [currentProjectId, recentRuns])

  React.useEffect(() => {
    if (!error) {
      lastToastMessageRef.current = null
      return
    }

    if (lastToastMessageRef.current === error) {
      return
    }

    toast({
      variant: 'destructive',
      title: 'Failed to load dashboard',
      description: error,
    })

    lastToastMessageRef.current = error
  }, [error, toast])

  function handleRetry() {
    if (!currentProjectId) {
      return
    }

    clearError()
    useDashboardStore.setState({ lastFetchedAt: null })
    void loadDashboard(currentProjectId)
  }

  if (isProjectsLoading) {
    return (
      <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
        <div className="space-y-4 p-6">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-5 w-96" />
          <SummarySkeletons />
        </div>
      </AppShell>
    )
  }

  if (noProjectSelected) {
    return (
      <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
        <div className="flex h-full items-center justify-center p-6">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" />
                Select or create a project to get started
              </CardTitle>
              <CardDescription>
                Choose an existing project or create a new one to load your dashboard metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button asChild>
                <Link href="/projects">Open Projects</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/projects">Create Project</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Execution Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Overview of all test runs and real-time execution metrics
          </p>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry} className="w-fit gap-2">
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading && !summary ? (
          <SummarySkeletons />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Runs</CardTitle>
                <Zap className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.activeRunsCount ?? 0}</div>
                <p className="mt-1 text-xs text-muted-foreground">Currently in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Pass Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.avgPassRate ?? 0}%</div>
                <p className="mt-1 text-xs text-muted-foreground">Across the last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                <ClipboardList className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.totalCases ?? 0}</div>
                <p className="mt-1 text-xs text-muted-foreground">Executed in the last 7 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Plans</CardTitle>
                <FolderKanban className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.plansCount ?? 0}</div>
                <p className="mt-1 text-xs text-muted-foreground">Non-archived test plans</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Repository Cases</CardTitle>
                <Files className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.repositoryCasesCount ?? 0}</div>
                <p className="mt-1 text-xs text-muted-foreground">Total cases in repository</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Repository Suites</CardTitle>
                <FolderTree className="h-4 w-4 text-cyan-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.repositorySuitesCount ?? 0}</div>
                <p className="mt-1 text-xs text-muted-foreground">Total suites in repository</p>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading && !summary ? (
          <TableSkeleton />
        ) : recentRuns.length === 0 && !error ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Runs</CardTitle>
              <CardDescription>Latest execution activity for the current project</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">No test runs yet</h2>
                <p className="text-sm text-muted-foreground">
                  Create your first test run to start tracking execution progress here.
                </p>
              </div>
              <Button asChild>
                <Link href="/test-runs/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test Run
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Test Runs</CardTitle>
                <CardDescription>Latest execution activity for the current project</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/test-runs">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Pass Rate</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRuns.map((run) => {
                    const status = statusConfig[run.status as BackendRunStatus] ?? statusConfig.OPEN
                    const StatusIcon = status.icon
                    const metrics = runMetricsById[run.id]
                    const progressValue = metrics ? Math.round(metrics.completionRate) : 0
                    const startedDate = run.startedAt ?? run.createdAt ?? null

                    return (
                      <TableRow key={run.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Link href={`/test-runs/${run.id}`} className="font-medium text-primary hover:underline">
                              {run.name}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                              {run.environment}
                              {run.buildNumber ? ` • ${run.buildNumber}` : ''}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={status.className}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {metrics || !isLoadingRunMetrics ? (
                            <div className="w-40 space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-medium">{progressValue}%</span>
                                <span className="text-muted-foreground">{metrics?.totalCases ?? 0} cases</span>
                              </div>
                              <Progress value={progressValue} className="h-2" />
                            </div>
                          ) : (
                            <Skeleton className="h-10 w-40" />
                          )}
                        </TableCell>
                        <TableCell>
                          {metrics || !isLoadingRunMetrics ? (
                            <span className="font-medium">{Math.round(metrics?.passRate ?? 0)}%</span>
                          ) : (
                            <Skeleton className="h-5 w-12" />
                          )}
                        </TableCell>
                        <TableCell>
                          {startedDate ? format(new Date(startedDate), 'MMM d, yyyy') : 'Not started'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  )
}