'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { RunDashboardData } from '@/types'
import { RunHeader } from './run-header'
import { ProgressOverview } from './progress-overview'
import { StatusDistributionBar } from './status-distribution-bar'
import { TesterPerformanceTable } from './tester-performance-table'
import { FailureDistributionChart } from './failure-distribution-chart'
import { RecentActivityFeed } from './recent-activity-feed'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RunDashboardProps {
  run: RunDashboardData | null
  isLoading?: boolean
  isLive?: boolean
  lastUpdated?: Date
  onEdit?: () => void
  onClone?: () => void
  onCloseRun?: () => void
  onExport?: () => void
  className?: string
}

export function RunDashboard({
  run,
  isLoading = false,
  isLive = false,
  lastUpdated,
  onEdit,
  onClone,
  onCloseRun,
  onExport,
  className,
}: RunDashboardProps) {
  if (isLoading && !run) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="space-y-4">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-6 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>

        <Skeleton className="h-40" />

        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!run) {
    return (
      <div className={cn('space-y-6', className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load test run data. Please try again later or contact support.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Live Update Indicator */}
      {isLive && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <p className="text-sm text-blue-700 font-medium">
              Live metrics - Last updated {lastUpdated?.toLocaleTimeString() || 'just now'}
            </p>
          </div>
        </div>
      )}

      {/* Run Header Section */}
      <RunHeader
        run={run}
        onEdit={onEdit}
        onClone={onClone}
        onCloseRun={onCloseRun}
        onExport={onExport}
      />

      {/* Progress Overview Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">Progress Overview</h2>
        <ProgressOverview metrics={run.metrics} />
      </div>

      {/* Status Distribution */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">Execution Status</h2>
        <StatusDistributionBar metrics={run.metrics} />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Failure Distribution and Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <FailureDistributionChart data={run.failureDistribution} />
        </div>

        {/* Tester Performance */}
        <div className="lg:col-span-3 space-y-6">
          <TesterPerformanceTable testers={run.testerPerformance} />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Activity & Updates</h2>
          <RecentActivityFeed items={run.activityFeed} maxItems={15} />
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Quick Stats</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-semibold">
                  {((run.metrics.completedCases / run.metrics.totalCases) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Pass Rate</span>
                <span className="font-semibold text-green-600">{run.metrics.passRate.toFixed(1)}%</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fail Rate</span>
                <span className="font-semibold text-red-600">{run.metrics.failRate.toFixed(1)}%</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Defects</span>
                <span className="font-semibold text-orange-600">{run.metrics.defectCount}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Risk</span>
                <span className="font-semibold capitalize text-amber-600">
                  {run.metrics.riskScore}
                </span>
              </div>
            </div>
          </div>

          {/* Test Execution Info */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">Execution Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Status</span>
                <p className="font-semibold capitalize mt-1">{run.status.replace('_', ' ')}</p>
              </div>
              <div className="h-px bg-border" />
              <div>
                <span className="text-muted-foreground">Created By</span>
                <p className="font-semibold mt-1">{run.createdBy.name}</p>
              </div>
              <div className="h-px bg-border" />
              <div>
                <span className="text-muted-foreground">Testers Active</span>
                <p className="font-semibold mt-1">{run.testerPerformance.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
