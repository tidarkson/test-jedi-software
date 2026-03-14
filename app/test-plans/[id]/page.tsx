'use client'

import * as React from 'react'
import { Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ReadinessGauge, PassRateTrendChart } from '@/components/test-plans'
import { AlertCircle, CheckCircle2, Edit, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import type { PassRateTrend } from '@/types'
import { usePlanStore } from '@/lib/store/plan-store'
import { useProjectStore } from '@/lib/store/project-store'
import { useAuthStore } from '@/lib/store/auth-store'

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-700'
    case 'pending_approval':
      return 'bg-yellow-100 text-yellow-700'
    case 'approved':
      return 'bg-green-100 text-green-700'
    case 'deprecated':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

function getStatusLabel(status: string) {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function PlanDetailPageContent() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const planId = params.id

  const currentProjectId = useProjectStore((state) => state.currentProjectId)
  const projects = useProjectStore((state) => state.projects)

  const user = useAuthStore((state) => state.user)

  const plan = usePlanStore((state) => state.currentPlan)
  const isLoading = usePlanStore((state) => state.isLoading)
  const loadPlan = usePlanStore((state) => state.loadPlan)
  const approvePlan = usePlanStore((state) => state.approvePlan)
  const removeRunFromPlan = usePlanStore((state) => state.removeRunFromPlan)

  const [selectedRunToRemove, setSelectedRunToRemove] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!currentProjectId || !planId) {
      return
    }

    void loadPlan(currentProjectId, planId).catch(() => undefined)
  }, [currentProjectId, planId, loadPlan])

  const normalizedRole = (user?.role ?? '').toUpperCase()
  const canApprove = normalizedRole === 'ADMIN' || normalizedRole === 'QA_LEAD'

  const handleApprove = async () => {
    if (!currentProjectId || !planId) {
      return
    }

    try {
      await approvePlan(currentProjectId, planId)
      toast.success('Plan approved successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to approve plan')
    }
  }

  const handleRemoveRun = async () => {
    if (!selectedRunToRemove || !currentProjectId || !planId) {
      return
    }

    try {
      await removeRunFromPlan(currentProjectId, planId, selectedRunToRemove)
      toast.success('Test run removed from plan')
      setSelectedRunToRemove(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove linked run')
    }
  }

  const passRateTrendData: PassRateTrend[] = React.useMemo(() => {
    if (!plan) {
      return []
    }

    if (plan.versions.length === 0) {
      return [
        {
          date: format(new Date(), 'MMM dd'),
          passRate: plan.passRate,
          totalTests: plan.totalCases,
          passedTests: Math.round((plan.totalCases * plan.passRate) / 100),
        },
      ]
    }

    return [...plan.versions]
      .sort((a, b) => a.version - b.version)
      .map((version) => ({
        date: format(version.createdAt, 'MMM dd'),
        passRate: plan.passRate,
        totalTests: plan.totalCases,
        passedTests: Math.round((plan.totalCases * plan.passRate) / 100),
      }))
  }, [plan])

  const breadcrumbs = [
    { title: 'Test Management', href: '/test-plans' },
    { title: 'Test Plans', href: '/test-plans' },
    { title: plan?.name ?? 'Plan Detail' },
  ]

  if (!projects.length || !currentProjectId) {
    return (
      <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
        <div className="flex h-full items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">No project selected</h2>
            <p className="mt-2 text-muted-foreground">Select a project to view test plan details.</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (isLoading && !plan) {
    return (
      <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
        <div className="h-full overflow-auto p-6">
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">Loading test plan...</CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  if (!plan || plan.id !== planId) {
    return (
      <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={[{ title: 'Test Plans', href: '/test-plans' }]} />}>
        <div className="flex items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">Plan not found</h3>
                <p className="mt-1 text-sm text-muted-foreground">The test plan you're looking for doesn't exist.</p>
                <Button className="mt-4" onClick={() => router.push('/test-plans')}>
                  Back to Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
      <div className="h-full overflow-auto p-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
              {plan.description && <p className="mt-2 text-muted-foreground">{plan.description}</p>}

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className={getStatusColor(plan.status)}>{getStatusLabel(plan.status)}</Badge>
                {plan.milestone && <Badge variant="outline">Milestone: {plan.milestone}</Badge>}
                <Badge variant="outline">Version {plan.version}</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              {canApprove && plan.status !== 'approved' && (
                <Button size="sm" onClick={handleApprove}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Release Readiness</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col items-center justify-center">
                <ReadinessGauge score={plan.readinessScore} size="lg" />
              </div>

              <div className="space-y-4">
                <div className="rounded-lg bg-accent/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Pass Rate Weight</p>
                  <div className="mt-2 flex items-end gap-2">
                    <div className="flex-1">
                      <Progress value={plan.readinessMetrics.passRateScore} className="h-2" />
                    </div>
                    <span className="text-sm font-bold">{plan.readinessMetrics.passRateScore}%</span>
                  </div>
                </div>

                <div className="rounded-lg bg-accent/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Completion Weight</p>
                  <div className="mt-2 flex items-end gap-2">
                    <div className="flex-1">
                      <Progress value={plan.readinessMetrics.completionScore} className="h-2" />
                    </div>
                    <span className="text-sm font-bold">{plan.readinessMetrics.completionScore}%</span>
                  </div>
                </div>

                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-muted-foreground">Defect Penalty</p>
                  <p className="mt-2 text-lg font-bold text-destructive">-{plan.readinessMetrics.defectPenalty} points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="runs">Linked Runs</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Test Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{plan.totalCases}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{plan.passRate}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{plan.completionRate}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Open Defects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-destructive">{plan.openDefects}</p>
                  </CardContent>
                </Card>
              </div>

              <PassRateTrendChart data={passRateTrendData} />

              <Card>
                <CardHeader>
                  <CardTitle>Linked Test Runs Summary</CardTitle>
                  <CardDescription>Individual metrics for each linked run</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Run Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Passed</TableHead>
                          <TableHead className="text-right">Failed</TableHead>
                          <TableHead className="text-right">Pass Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plan.linkedRuns.map((run) => (
                          <TableRow key={run.id}>
                            <TableCell className="font-medium">{run.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{run.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">{run.statistics.total}</TableCell>
                            <TableCell className="text-right text-green-600">{run.statistics.passed}</TableCell>
                            <TableCell className="text-right text-red-600">{run.statistics.failed}</TableCell>
                            <TableCell className="text-right font-bold">{run.statistics.passRate.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="runs" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Linked Test Runs</CardTitle>
                      <CardDescription>Manage test runs included in this plan</CardDescription>
                    </div>
                    <Button size="sm" disabled>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Run
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {plan.linkedRuns.length > 0 ? (
                    <div className="space-y-3">
                      {plan.linkedRuns.map((run) => (
                        <div key={run.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex-1">
                            <h4 className="font-medium">{run.name}</h4>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {run.statistics.total} tests • Pass rate: {run.statistics.passRate.toFixed(1)}%
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedRunToRemove(run.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-center text-muted-foreground">No test runs linked yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="versions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Version History</CardTitle>
                  <CardDescription>Timeline of plan versions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan.versions.map((version, index) => (
                      <div key={version.id} className="relative flex gap-4 pb-4">
                        {index < plan.versions.length - 1 && <div className="absolute left-4 top-10 h-12 w-0.5 bg-border" />}
                        <div className="relative">
                          <div className="h-9 w-9 rounded-full border-4 border-background bg-primary" />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="rounded-lg border p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">Version {version.version}</h4>
                                <p className="mt-1 text-sm text-muted-foreground">by {version.createdBy.name}</p>
                              </div>
                              <div className="text-right text-xs text-muted-foreground">{format(version.createdAt, 'MMM dd, yyyy')}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ID</p>
                      <p className="mt-1 font-mono text-sm">{plan.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p className="mt-1">
                        <Badge className={getStatusColor(plan.status)}>{getStatusLabel(plan.status)}</Badge>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created By</p>
                      <p className="mt-1">{plan.createdBy.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                      <p className="mt-1">{format(plan.createdAt, 'MMM dd, yyyy')}</p>
                    </div>
                    {plan.approvedBy && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                        <p className="mt-1">{plan.approvedBy.name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedRunToRemove && (
        <AlertDialog open={!!selectedRunToRemove} onOpenChange={() => setSelectedRunToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Linked Run</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to remove this test run from the plan?</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveRun}>Remove</AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AppShell>
  )
}

export default function PlanDetailPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PlanDetailPageContent />
    </Suspense>
  )
}
