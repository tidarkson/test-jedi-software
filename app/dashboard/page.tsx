'use client'

import * as React from 'react'
import Link from 'next/link'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  PlayCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Clock,
  Zap,
} from 'lucide-react'
import { format } from 'date-fns'

// Mock data for dashboard overview
const mockTestRuns = [
  {
    id: 'TR-001',
    name: 'Sprint 23 - Full Regression Testing',
    status: 'in_progress' as const,
    environment: 'Staging',
    buildNumber: 'v2.5.0-rc.1',
    total: 85,
    passed: 68,
    failed: 9,
    blocked: 0,
    remaining: 8,
    startedAt: new Date('2026-03-01'),
    progress: 90,
    riskScore: 'medium' as const,
  },
  {
    id: 'TR-002',
    name: 'Hotfix v2.4.1 Smoke Test',
    status: 'completed' as const,
    environment: 'Production',
    buildNumber: 'v2.4.1',
    total: 12,
    passed: 11,
    failed: 1,
    blocked: 0,
    remaining: 0,
    startedAt: new Date('2026-03-02'),
    progress: 100,
    riskScore: 'low' as const,
  },
  {
    id: 'TR-003',
    name: 'API Integration Tests',
    status: 'in_progress' as const,
    environment: 'QA',
    buildNumber: 'v2.5.0-dev.5',
    total: 45,
    passed: 38,
    failed: 3,
    blocked: 1,
    remaining: 3,
    startedAt: new Date('2026-03-02'),
    progress: 93,
    riskScore: 'low' as const,
  },
  {
    id: 'TR-004',
    name: 'Security & Performance Audit',
    status: 'scheduled' as const,
    environment: 'Staging',
    buildNumber: 'v2.5.0-rc.2',
    total: 60,
    passed: 0,
    failed: 0,
    blocked: 0,
    remaining: 60,
    startedAt: new Date('2026-03-05'),
    progress: 0,
    riskScore: 'high' as const,
  },
]

const statusConfig = {
  scheduled: { label: 'Scheduled', icon: Clock, className: 'bg-blue-100 text-blue-700 border-blue-200', bgColor: 'bg-blue-50' },
  in_progress: { label: 'In Progress', icon: PlayCircle, className: 'bg-amber-100 text-amber-700 border-amber-200', bgColor: 'bg-amber-50' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-green-100 text-green-700 border-green-200', bgColor: 'bg-green-50' },
  paused: { label: 'Paused', icon: AlertCircle, className: 'bg-gray-100 text-gray-700 border-gray-200', bgColor: 'bg-gray-50' },
}

const riskConfig = {
  low: { label: 'Low', className: 'bg-green-100 text-green-700' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-700' },
}

export default function DashboardPage() {
  const activeRuns = mockTestRuns.filter((r) => r.status === 'in_progress').length
  const completedThisWeek = mockTestRuns.filter((r) => r.status === 'completed').length
  const totalFailures = mockTestRuns.reduce((sum, r) => sum + r.failed, 0)
  const totalPassed = mockTestRuns.reduce((sum, r) => sum + r.passed, 0)
  const totalCases = mockTestRuns.reduce((sum, r) => sum + r.total, 0)
  const overallPassRate = totalCases > 0 ? ((totalPassed / totalCases) * 100).toFixed(1) : '0.0'

  const highRiskRuns = mockTestRuns.filter((r) => r.riskScore === 'high' || r.riskScore === 'critical')

  const breadcrumbs = [{ title: 'Overview' }, { title: 'Dashboard' }]

  return (
    <AppShell sidebar={<Sidebar />} header={<Header breadcrumbs={breadcrumbs} />}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Execution Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Overview of all test runs and real-time execution metrics
          </p>
        </div>

        {/* High Risk Alert */}
        {highRiskRuns.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700 font-medium">
              {highRiskRuns.length} test run{highRiskRuns.length > 1 ? 's' : ''} with high risk score requires attention
            </AlertDescription>
          </Alert>
        )}

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Active Runs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Runs</CardTitle>
              <Zap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRuns}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
            </CardContent>
          </Card>

          {/* Completed This Week */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedThisWeek}</div>
              <p className="text-xs text-muted-foreground mt-1">Finished successfully</p>
            </CardContent>
          </Card>

          {/* Overall Pass Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallPassRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalPassed} of {totalCases} passed
              </p>
            </CardContent>
          </Card>

          {/* Total Failures */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Cases</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFailures}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all runs</p>
            </CardContent>
          </Card>
        </div>

        {/* Test Runs Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Test Runs</CardTitle>
              <CardDescription>Click on any run to view detailed dashboard and metrics</CardDescription>
            </div>
            <Button asChild>
              <Link href="/test-runs">View All</Link>
            </Button>
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
                  <TableHead>Risk</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTestRuns.map((run) => {
                  const StatusConfig = statusConfig[run.status]
                  const StatusIcon = StatusConfig.icon
                  const riskBadgeConfig = riskConfig[run.riskScore]
                  const passRate = run.total > 0 ? Math.round((run.passed / run.total) * 100) : 0

                  return (
                    <TableRow key={run.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Link
                            href={`/test-runs/${run.id}`}
                            className="font-medium hover:underline text-primary"
                          >
                            {run.name}
                          </Link>
                          <span className="text-xs text-muted-foreground font-mono">
                            {run.id} • {run.buildNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={StatusConfig.className}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {StatusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{run.environment}</TableCell>
                      <TableCell>
                        <div className="w-40 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">{run.progress}%</span>
                            <span className="text-muted-foreground">
                              {run.total - run.remaining}/{run.total}
                            </span>
                          </div>
                          <Progress value={run.progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="flex items-center gap-1 text-green-600 font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            {run.passed}
                          </span>
                          {run.failed > 0 && (
                            <span className="flex items-center gap-1 text-red-600 font-semibold">
                              <XCircle className="h-3 w-3" />
                              {run.failed}
                            </span>
                          )}
                          {run.blocked > 0 && (
                            <span className="flex items-center gap-1 text-orange-600 font-semibold">
                              <AlertCircle className="h-3 w-3" />
                              {run.blocked}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={riskBadgeConfig.className} variant="outline">
                          {riskBadgeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/test-runs/${run.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            View <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Summary Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Execution Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Execution Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Test Cases</span>
                  <span className="text-2xl font-bold">{totalCases}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cases Executed</span>
                  <span className="text-2xl font-bold">{totalCases - mockTestRuns.reduce((sum, r) => sum + r.remaining, 0)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pass Rate</span>
                  <span className="text-2xl font-bold text-green-600">{overallPassRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/test-runs/new">Create New Test Run</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/test-runs">View All Runs</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/test-plans">View Test Plans</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/reports">View Reports</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
