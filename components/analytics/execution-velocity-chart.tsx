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
import { ExecutionVelocity } from '@/types'
import { cn } from '@/lib/utils'

interface ExecutionVelocityChartProps {
  data: ExecutionVelocity[]
  className?: string
  height?: number
}

const chartConfig = {
  velocity: {
    label: 'Execution Velocity',
    theme: {
      light: '#8b5cf6',
      dark: '#a78bfa',
    },
  },
}

export function ExecutionVelocityChart({
  data,
  className,
  height = 350,
}: ExecutionVelocityChartProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Execution Velocity Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            <p className="text-sm">No velocity data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const avgVelocity = Math.round(
    data.reduce((sum, item) => sum + item.velocity, 0) / data.length
  )
  const totalExecuted = data.reduce((sum, item) => sum + item.executedCases, 0)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Execution Velocity Trend</span>
          <div className="text-right">
            <div className="text-2xl font-bold">{avgVelocity}</div>
            <div className="text-xs font-medium text-muted-foreground">
              cases/day average
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
                dataKey="date"
                stroke="currentColor"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="currentColor"
                style={{ fontSize: '12px' }}
                label={{ value: 'Cases/Day', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="velocity"
                stroke="var(--color-velocity)"
                strokeWidth={3}
                dot={{ fill: 'var(--color-velocity)', r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                name="Execution Velocity"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Executed</p>
            <p className="text-lg font-semibold text-purple-600">
              {totalExecuted}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Period Average</p>
            <p className="text-lg font-semibold">
              {avgVelocity} cases/day
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
