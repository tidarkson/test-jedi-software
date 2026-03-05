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
import { DefectStatus } from '@/types'
import { cn } from '@/lib/utils'

interface DefectStatusChartProps {
  data: DefectStatus[]
  className?: string
  height?: number
}

const chartConfig = {
  open: {
    label: 'Open',
    theme: {
      light: '#ef4444',
      dark: '#f87171',
    },
  },
  closed: {
    label: 'Closed',
    theme: {
      light: '#10b981',
      dark: '#34d399',
    },
  },
}

export function DefectStatusChart({
  data,
  className,
  height = 350,
}: DefectStatusChartProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Open vs Closed Defects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            <p className="text-sm">No defect data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalOpen = data.reduce((sum, item) => sum + item.open, 0)
  const totalClosed = data.reduce((sum, item) => sum + item.closed, 0)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Open vs Closed Defects Over Time</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ChartContainer config={chartConfig} className={cn('w-full', className)}>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
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
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                dataKey="open"
                stackId="a"
                fill="var(--color-open)"
                name="Open"
                isAnimationActive={true}
              />
              <Bar
                dataKey="closed"
                stackId="a"
                fill="var(--color-closed)"
                name="Closed"
                isAnimationActive={true}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Open</p>
            <p className="text-lg font-semibold text-red-600">{totalOpen}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Closed</p>
            <p className="text-lg font-semibold text-green-600">{totalClosed}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
