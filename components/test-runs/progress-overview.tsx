'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { RunMetrics, RiskLevel } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from 'lucide-react'

interface ProgressOverviewProps {
  metrics: RunMetrics
  className?: string
}

export function ProgressOverview({ metrics, className }: ProgressOverviewProps) {
  const completionPercentage = (metrics.completedCases / metrics.totalCases) * 100

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-700 hover:bg-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      case 'high':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-200'
      case 'critical':
        return 'bg-red-100 text-red-700 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getRiskLabel = (risk: RiskLevel) => {
    return risk.charAt(0).toUpperCase() + risk.slice(1)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {/* Total Cases Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          <BarChart3 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalCases}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.completedCases} completed, {metrics.remainingCases} remaining
          </p>
          <Progress value={completionPercentage} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* Pass Rate Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.passRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.statusDistribution.passed} passed tests
          </p>
          <Progress
            value={metrics.passRate}
            className="mt-2 h-2 [&>div]:bg-green-500"
          />
        </CardContent>
      </Card>

      {/* Fail Rate Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fail Rate</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.failRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.statusDistribution.failed} failed tests
          </p>
          <Progress
            value={metrics.failRate}
            className="mt-2 h-2 [&>div]:bg-red-500"
          />
        </CardContent>
      </Card>

      {/* Execution Time Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Execution Time</CardTitle>
          <Clock className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatTime(metrics.actualTime)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Est: {formatTime(metrics.estimatedTime)}
          </p>
          {metrics.actualTime > metrics.estimatedTime && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              +{formatTime(metrics.actualTime - metrics.estimatedTime)} over estimate
            </p>
          )}
        </CardContent>
      </Card>

      {/* Defect Count Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Defects</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.defectCount}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Logged during execution
          </p>
        </CardContent>
      </Card>

      {/* Risk Score Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Run Risk Score</CardTitle>
          <div className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Badge
            variant="outline"
            className={cn(
              'text-sm font-semibold px-2 py-1 mb-2',
              getRiskColor(metrics.riskScore)
            )}
          >
            {getRiskLabel(metrics.riskScore)}
          </Badge>
          <p className="text-xs text-muted-foreground">
            Based on failure rate and defects
          </p>
        </CardContent>
      </Card>

      {/* Status Summary Card */}
      <Card className="md:col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Passed</p>
              <p className="text-lg font-semibold text-green-600">{metrics.statusDistribution.passed}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Failed</p>
              <p className="text-lg font-semibold text-red-600">{metrics.statusDistribution.failed}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Blocked</p>
              <p className="text-lg font-semibold text-orange-600">{metrics.statusDistribution.blocked}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Retest</p>
              <p className="text-lg font-semibold text-blue-600">{metrics.statusDistribution.retest}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Skipped</p>
              <p className="text-lg font-semibold text-gray-600">{metrics.statusDistribution.skipped}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Untested</p>
              <p className="text-lg font-semibold text-slate-400">{metrics.statusDistribution.untested}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
