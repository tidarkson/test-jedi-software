'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { RunMetrics } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface StatusDistributionBarProps {
  metrics: RunMetrics
  className?: string
}

interface StatusSegment {
  key: keyof RunMetrics['statusDistribution']
  label: string
  color: string
  count: number
}

export function StatusDistributionBar({
  metrics,
  className,
}: StatusDistributionBarProps) {
  const segments: StatusSegment[] = [
    {
      key: 'passed',
      label: 'Passed',
      color: 'bg-green-500',
      count: metrics.statusDistribution.passed,
    },
    {
      key: 'failed',
      label: 'Failed',
      color: 'bg-red-500',
      count: metrics.statusDistribution.failed,
    },
    {
      key: 'blocked',
      label: 'Blocked',
      color: 'bg-orange-500',
      count: metrics.statusDistribution.blocked,
    },
    {
      key: 'retest',
      label: 'Retest',
      color: 'bg-blue-500',
      count: metrics.statusDistribution.retest,
    },
    {
      key: 'skipped',
      label: 'Skipped',
      color: 'bg-gray-500',
      count: metrics.statusDistribution.skipped,
    },
    {
      key: 'untested',
      label: 'Untested',
      color: 'bg-slate-200',
      count: metrics.statusDistribution.untested,
    },
  ]

  const totalCases = segments.reduce((sum, s) => sum + s.count, 0)

  const getPercentage = (count: number) => {
    if (totalCases === 0) return 0
    return (count / totalCases) * 100
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Segmented Bar */}
        <div className="space-y-2">
          <TooltipProvider delayDuration={200}>
            <div className="flex h-8 overflow-hidden rounded-md border border-border">
              {segments.map((segment) => {
                const percentage = getPercentage(segment.count)
                return percentage > 0 ? (
                  <Tooltip key={segment.key}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn('flex items-center justify-center text-xs font-semibold text-white transition-all hover:opacity-80', segment.color)}
                        style={{ width: `${percentage}%`, minWidth: percentage < 5 ? '40px' : 'auto' }}
                      >
                        {percentage > 8 && `${percentage.toFixed(0)}%`}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {segment.label}: {segment.count} ({percentage.toFixed(1)}%)
                    </TooltipContent>
                  </Tooltip>
                ) : null
              })}
            </div>
          </TooltipProvider>

          <div className="text-xs text-muted-foreground">
            Total: {totalCases} cases
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {segments.map((segment) => {
            const percentage = getPercentage(segment.count)
            return (
              <div key={segment.key} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={cn('h-3 w-3 rounded-sm', segment.color)} />
                  <span className="text-xs font-medium text-foreground">{segment.label}</span>
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {segment.count}
                </div>
                <div className="text-xs text-muted-foreground">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-3 border-t pt-4 md:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Completion</p>
            <p className="text-lg font-bold text-foreground">
              {((metrics.completedCases / metrics.totalCases) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Success Rate</p>
            <p className="text-lg font-bold text-green-600">
              {metrics.passRate.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Failure Rate</p>
            <p className="text-lg font-bold text-red-600">
              {metrics.failRate.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Blocking Rate</p>
            <p className="text-lg font-bold text-orange-600">
              {(
                ((metrics.statusDistribution.blocked +
                  metrics.statusDistribution.failed) /
                  metrics.totalCases) *
                100
              ).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
