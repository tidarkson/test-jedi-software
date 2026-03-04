'use client'

import * as React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FailureDistributed } from '@/types'
import { cn } from '@/lib/utils'

interface FailureDistributionChartProps {
  data: FailureDistributed[]
  className?: string
  height?: number
}

const chartConfig = {
  failureCount: {
    label: 'Failures',
    theme: {
      light: '#ef4444',
      dark: '#f87171',
    },
  },
  passRate: {
    label: 'Pass Rate',
    theme: {
      light: '#10b981',
      dark: '#34d399',
    },
  },
}

export function FailureDistributionChart({
  data,
  className,
  height = 350,
}: FailureDistributionChartProps) {
  const sortedData = React.useMemo(
    () => [...data].sort((a, b) => b.failureCount - a.failureCount),
    [data]
  )

  const totalFailures = React.useMemo(
    () => sortedData.reduce((sum, item) => sum + item.failureCount, 0),
    [sortedData]
  )

  const avgPassRate = React.useMemo(
    () =>
      sortedData.length > 0
        ? sortedData.reduce((sum, item) => sum + item.passRate, 0) / sortedData.length
        : 0,
    [sortedData]
  )

  if (sortedData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Failure Distribution by Suite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            <p className="text-sm">No failure data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Failure Distribution by Suite</span>
          <span className="text-xs font-normal text-muted-foreground">
            {sortedData.length} suites
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer config={chartConfig} className={cn('w-full', className)}>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={sortedData}
              margin={{ top: 5, right: 30, left: 0, bottom: 80 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis type="number" stroke="currentColor" style={{ fontSize: '12px' }} />
              <YAxis
                dataKey="suiteName"
                type="category"
                width={150}
                stroke="currentColor"
                style={{ fontSize: '11px' }}
                tick={{ textAnchor: 'end' }}
              />
              <Tooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Legend />
              <Bar
                dataKey="failureCount"
                fill="var(--color-failureCount)"
                radius={[0, 8, 8, 0]}
                name="Failures"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Statistics */}
        <div className="border-t pt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Total Failures</p>
            <p className="text-lg font-bold text-red-600">{totalFailures}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Avg Pass Rate</p>
            <p className="text-lg font-bold text-green-600">{avgPassRate.toFixed(1)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Most Failures</p>
            <p className="text-lg font-bold text-orange-600">{sortedData[0]?.suiteName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Suites Checked</p>
            <p className="text-lg font-bold">{sortedData.length}</p>
          </div>
        </div>

        {/* Risk Indicator */}
        {totalFailures > 20 && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="font-medium">⚠️ High Failure Rate</p>
            <p className="text-xs mt-1">
              High number of failures across suites. Consider investigation and potential rollback.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
