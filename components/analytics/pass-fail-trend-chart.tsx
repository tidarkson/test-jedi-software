'use client'

import * as React from 'react'
import {
  AreaChart,
  Area,
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
import { PassFailTrend } from '@/types'
import { cn } from '@/lib/utils'

interface PassFailTrendChartProps {
  data: PassFailTrend[]
  className?: string
  height?: number
}

const chartConfig = {
  passed: {
    label: 'Passed',
    theme: {
      light: '#10b981',
      dark: '#34d399',
    },
  },
  failed: {
    label: 'Failed',
    theme: {
      light: '#ef4444',
      dark: '#f87171',
    },
  },
}

export function PassFailTrendChart({
  data,
  className,
  height = 350,
}: PassFailTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Pass/Fail Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center text-muted-foreground">
            <p className="text-sm">No trend data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pass/Fail Trend (12 Weeks)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className={cn('w-full', className)}>
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart
              data={data}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-passed)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-passed)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-failed)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-failed)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                stroke="currentColor"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="currentColor"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="passed"
                stackId="1"
                stroke="var(--color-passed)"
                fillOpacity={1}
                fill="url(#colorPassed)"
                isAnimationActive={true}
              />
              <Area
                type="monotone"
                dataKey="failed"
                stackId="1"
                stroke="var(--color-failed)"
                fillOpacity={1}
                fill="url(#colorFailed)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
