'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
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
import {
  ReadinessGauge,
  PassRateTrendChart,
} from '@/components/test-plans'
import { TestPlan, TestRun, PassRateTrend } from '@/types'
import {
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

// Mock test plans data
const mockTestPlans: { [key: string]: TestPlan } = {
  'TP-001': {
    id: 'TP-001',
    name: 'Release v2.5 Validation Plan',
    description:
      'Comprehensive testing plan for the 2.5 release covering all new features and regression scenarios.',
    version: 3,
    status: 'approved',
    milestone: 'Release v2.5',
    linkedRuns: [
      {
        id: 'TR-001',
        name: 'Sprint 22 Regression',
        status: 'completed',
        environment: 'Staging',
        testCases: [],
        createdBy: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'engineer' },
        statistics: {
          total: 45,
          passed: 40,
          failed: 3,
          blocked: 2,
          retest: 0,
          skipped: 0,
          na: 0,
          deferred: 0,
          passRate: 88.9,
        },
      },
      {
        id: 'TR-002',
        name: 'Hotfix v2.4.1 Smoke Test',
        status: 'completed',
        environment: 'Production',
        testCases: [],
        createdBy: { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'engineer' },
        statistics: {
          total: 12,
          passed: 11,
          failed: 1,
          blocked: 0,
          retest: 0,
          skipped: 0,
          na: 0,
          deferred: 0,
          passRate: 91.7,
        },
      },
    ],
    tags: ['release', 'regression', 'critical'],
    readinessScore: 88,
    readinessMetrics: {
      passRateWeight: 0.5,
      passRateScore: 90,
      completionWeight: 0.3,
      completionScore: 95,
      defectWeight: 0.2,
      defectPenalty: 5,
      overallScore: 88,
    },
    passRate: 89.5,
    completionRate: 95,
    openDefects: 3,
    totalCases: 87,
    versions: [
      {
        id: 'v1',
        version: 1,
        createdAt: new Date('2026-02-15'),
        createdBy: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'engineer' },
        changes: 'Initial version',
      },
      {
        id: 'v2',
        version: 2,
        createdAt: new Date('2026-02-20'),
        createdBy: { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'engineer' },
        changes: 'Added API integration tests',
      },
      {
        id: 'v3',
        version: 3,
        createdAt: new Date('2026-02-28'),
        createdBy: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'engineer' },
        changes: 'Updated test scenarios and fixed test data',
      },
    ],
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-02-28'),
    createdBy: { id: '1', name: 'John Doe', email: 'john@example.com', role: 'engineer' },
    approvedBy: { id: '3', name: 'Manager', email: 'manager@example.com', role: 'manager' },
  },
}

// Mock pass rate trend data
const mockPassRateTrend: PassRateTrend[] = [
  { date: 'Feb 15', passRate: 75, totalTests: 87, passedTests: 65 },
  { date: 'Feb 17', passRate: 78, totalTests: 87, passedTests: 68 },
  { date: 'Feb 20', passRate: 82, totalTests: 87, passedTests: 71 },
  { date: 'Feb 22', passRate: 85, totalTests: 87, passedTests: 74 },
  { date: 'Feb 25', passRate: 87, totalTests: 87, passedTests: 76 },
  { date: 'Feb 28', passRate: 89.5, totalTests: 87, passedTests: 78 },
]

export default function PlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const planId = params.id as string
  const plan = mockTestPlans[planId]

  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [selectedRunToRemove, setSelectedRunToRemove] = React.useState<string | null>(null)

  if (!plan) {
    return (
      <AppShell
        sidebar={<Sidebar />}
        header={<Header breadcrumbs={[{ title: 'Test Plans', href: '/test-plans' }]} />}
      >
        <div className="flex items-center justify-center p-6">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-semibold">Plan not found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  The test plan you're looking for doesn't exist.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => router.push('/test-plans')}
                >
                  Back to Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  const getStatusColor = (status: string) => {
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

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const breadcrumbs = [
    { title: 'Test Management', href: '/test-plans' },
    { title: 'Test Plans', href: '/test-plans' },
    { title: plan.name },
  ]

  return (
    <AppShell
      sidebar={<Sidebar />}
      header={<Header breadcrumbs={breadcrumbs} />}
    >
      <div className="h-full overflow-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
                  {plan.description && (
                    <p className="mt-2 text-muted-foreground">{plan.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className={getStatusColor(plan.status)}>
                  {getStatusLabel(plan.status)}
                </Badge>
                {plan.milestone && (
                  <Badge variant="outline">Milestone: {plan.milestone}</Badge>
                )}
                <Badge variant="outline">Version {plan.version}</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Readiness Score Card */}
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Pass Rate Weight
                  </p>
                  <div className="mt-2 flex items-end gap-2">
                    <div className="flex-1">
                      <Progress
                        value={plan.readinessMetrics.passRateScore}
                        className="h-2"
                      />
                    </div>
                    <span className="text-sm font-bold">
                      {plan.readinessMetrics.passRateScore}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(plan.readinessMetrics.passRateWeight * 100).toFixed(0)}% weight
                  </p>
                </div>

                <div className="rounded-lg bg-accent/50 p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Completion Weight
                  </p>
                  <div className="mt-2 flex items-end gap-2">
                    <div className="flex-1">
                      <Progress
                        value={plan.readinessMetrics.completionScore}
                        className="h-2"
                      />
                    </div>
                    <span className="text-sm font-bold">
                      {plan.readinessMetrics.completionScore}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(plan.readinessMetrics.completionWeight * 100).toFixed(0)}% weight
                  </p>
                </div>

                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Defect Penalty
                  </p>
                  <p className="mt-2 text-lg font-bold text-destructive">
                    -{plan.readinessMetrics.defectPenalty} points
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(plan.readinessMetrics.defectWeight * 100).toFixed(0)}% weight
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="runs">Linked Runs</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Aggregated Metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Test Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{plan.totalCases}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Pass Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{plan.passRate}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Completion Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{plan.completionRate}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Open Defects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-destructive">
                      {plan.openDefects}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Pass Rate Trend Chart */}
              <PassRateTrendChart data={mockPassRateTrend} />

              {/* Linked Runs Summary Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Linked Test Runs Summary</CardTitle>
                  <CardDescription>
                    Individual metrics for each linked run
                  </CardDescription>
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
                              <Badge
                                variant="outline"
                                className={
                                  run.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-blue-100 text-blue-700'
                                }
                              >
                                {run.status.charAt(0).toUpperCase() +
                                  run.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {run.statistics.total}
                            </TableCell>
                            <TableCell className="text-right text-green-600">
                              {run.statistics.passed}
                            </TableCell>
                            <TableCell className="text-right text-red-600">
                              {run.statistics.failed}
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {run.statistics.passRate.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Runs Tab */}
            <TabsContent value="runs" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Linked Test Runs</CardTitle>
                      <CardDescription>
                        Manage test runs included in this plan
                      </CardDescription>
                    </div>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Run
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {plan.linkedRuns.length > 0 ? (
                    <div className="space-y-3">
                      {plan.linkedRuns.map((run) => (
                        <div
                          key={run.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{run.name}</h4>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {run.statistics.total} tests • Pass rate:{' '}
                              {run.statistics.passRate.toFixed(1)}%
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRunToRemove(run.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                      <p className="text-center text-muted-foreground">
                        No test runs linked yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Versions Tab */}
            <TabsContent value="versions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Version History</CardTitle>
                  <CardDescription>
                    Timeline of plan versions with changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plan.versions.map((version, index) => (
                      <div
                        key={version.id}
                        className="relative flex gap-4 pb-4"
                      >
                        {/* Timeline line */}
                        {index < plan.versions.length - 1 && (
                          <div className="absolute left-4 top-10 h-12 w-0.5 bg-border" />
                        )}

                        {/* Timeline dot */}
                        <div className="relative">
                          <div className="h-9 w-9 rounded-full border-4 border-background bg-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <div className="rounded-lg border p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold">
                                  Version {version.version}
                                </h4>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  by {version.createdBy.name}
                                </p>
                                {version.changes && (
                                  <p className="mt-2 text-sm">
                                    {version.changes}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-xs text-muted-foreground">
                                {format(version.createdAt, 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        ID
                      </p>
                      <p className="mt-1 font-mono text-sm">{plan.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Status
                      </p>
                      <p className="mt-1">
                        <Badge className={getStatusColor(plan.status)}>
                          {getStatusLabel(plan.status)}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Created By
                      </p>
                      <p className="mt-1">{plan.createdBy.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Created Date
                      </p>
                      <p className="mt-1">
                        {format(plan.createdAt, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    {plan.approvedBy && (
                      <>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Approved By
                          </p>
                          <p className="mt-1">{plan.approvedBy.name}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {plan.tags && plan.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {plan.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test plan? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success('Test plan deleted successfully')
                router.push('/test-plans')
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Run Dialog */}
      {selectedRunToRemove && (
        <AlertDialog
          open={!!selectedRunToRemove}
          onOpenChange={() => setSelectedRunToRemove(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Linked Run</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this test run from the plan?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  toast.success('Test run removed from plan')
                  setSelectedRunToRemove(null)
                }}
              >
                Remove
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AppShell>
  )
}
