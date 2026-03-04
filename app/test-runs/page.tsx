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
import { Plus, PlayCircle, Clock, CheckCircle2, XCircle, Pause } from 'lucide-react'
import { format } from 'date-fns'

// Mock test runs data
const mockTestRuns = [
  {
    id: 'TR-001',
    name: 'Sprint 22 Regression',
    status: 'completed' as const,
    environment: 'Staging',
    total: 45,
    passed: 40,
    failed: 3,
    blocked: 2,
    startedAt: new Date('2026-02-25'),
    completedAt: new Date('2026-02-26'),
  },
  {
    id: 'TR-002',
    name: 'Hotfix v2.4.1 Smoke Test',
    status: 'active' as const,
    environment: 'Production',
    total: 12,
    passed: 8,
    failed: 1,
    blocked: 0,
    startedAt: new Date('2026-03-02'),
    completedAt: null,
  },
  {
    id: 'TR-003',
    name: 'API Integration Tests',
    status: 'active' as const,
    environment: 'QA',
    total: 30,
    passed: 15,
    failed: 2,
    blocked: 1,
    startedAt: new Date('2026-03-01'),
    completedAt: null,
  },
]

const statusConfig = {
  active: { label: 'Active', icon: PlayCircle, className: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'bg-green-100 text-green-700 border-green-200' },
  paused: { label: 'Paused', icon: Pause, className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
}

export default function TestRunsPage() {
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
          <Button asChild>
            <Link href="/test-runs/new">
              <Plus className="mr-2 h-4 w-4" />
              New Test Run
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Runs</CardDescription>
              <CardTitle className="text-3xl">2</CardTitle>
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
              <CardTitle className="text-3xl">5</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                85% average pass rate
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Failed Cases</CardDescription>
              <CardTitle className="text-3xl">6</CardTitle>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockTestRuns.map((run) => {
                  const StatusIcon = statusConfig[run.status].icon
                  const progressPercent = Math.round(
                    ((run.passed + run.failed + run.blocked) / run.total) * 100
                  )
                  const passRate = Math.round((run.passed / run.total) * 100)

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
                          className={statusConfig[run.status].className}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig[run.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{run.environment}</TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="mb-1 flex justify-between text-xs">
                            <span>{progressPercent}%</span>
                            <span className="text-muted-foreground">
                              {run.passed + run.failed + run.blocked}/{run.total}
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-green-600">{run.passed} passed</span>
                          <span className="text-red-600">{run.failed} failed</span>
                          {run.blocked > 0 && (
                            <span className="text-orange-600">{run.blocked} blocked</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(run.startedAt, 'MMM d, yyyy')}
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
