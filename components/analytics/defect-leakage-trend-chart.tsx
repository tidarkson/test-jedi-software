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
import { DefectLeakageTrend } from '@/types'
import { cn } from '@/lib/utils'

interface DefectLeakageTrendChartProps {
  data: DefectLeakageTrend[]
  className?: string
  height?: number
}

const chartConfig = {
  leakageRate: {
    label: 'Leakage Rate %',
    theme: {
      light: '#ef4444',
      dark: '#f87171',
    },
  },
}

export function DefectLeakageTrendChart({
  data,
  className,
  height = 350,
}: DefectLeakageTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Defect Leakage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            <p className="text-sm">No leakage data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentLeakage = data[data.length - 1]?.leakageRate || 0
  const avgLeakage = data.reduce((sum, item) => sum + item.leakageRate, 0) / data.length

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Defect Leakage Trend</span>
          <div className="text-right">
            <div className="text-2xl font-bold">{currentLeakage.toFixed(2)}%</div>
            <div className="text-xs font-medium text-muted-foreground">
              Current leakage rate
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
                label={{ value: 'Leakage Rate %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="leakageRate"
                stroke="var(--color-leakageRate)"
                strokeWidth={3}
                dot={{ fill: 'var(--color-leakageRate)', r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                name="Leakage Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Average Leakage</p>
            <p className="text-lg font-semibold text-red-600">
              {avgLeakage.toFixed(2)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Defects Leaked</p>
            <p className="text-lg font-semibold">
              {data.reduce((sum, item) => sum + item.defectsLeaked, 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
