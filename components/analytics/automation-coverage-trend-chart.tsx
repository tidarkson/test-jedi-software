'use client'

import * as React from 'react'
import {
  LineChart,
  Line,
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
import { AutomationCoverageTrend } from '@/types'
import { cn } from '@/lib/utils'

interface AutomationCoverageTrendChartProps {
  data: AutomationCoverageTrend[]
  className?: string
  height?: number
}

const chartConfig = {
  coverage: {
    label: 'Coverage %',
    theme: {
      light: '#3b82f6',
      dark: '#60a5fa',
    },
  },
}

export function AutomationCoverageTrendChart({
  data,
  className,
  height = 350,
}: AutomationCoverageTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Automation Coverage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            <p className="text-sm">No coverage data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentCoverage = data[data.length - 1]?.coverage || 0
  const previousCoverage = data[0]?.coverage || 0
  const trend = currentCoverage - previousCoverage

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Automation Coverage Trend</span>
          <div className="text-right">
            <div className="text-2xl font-bold">{currentCoverage}%</div>
            <div className={cn(
              'text-xs font-medium',
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {trend >= 0 ? '+' : ''}{trend}% from start
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={cn('w-full', className)}>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="week"
                stroke="currentColor"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="currentColor"
                style={{ fontSize: '12px' }}
                domain={[0, 100]}
                label={{ value: 'Coverage %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="coverage"
                stroke="var(--color-coverage)"
                strokeWidth={3}
                dot={{ fill: 'var(--color-coverage)', r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                name="Automation Coverage %"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
