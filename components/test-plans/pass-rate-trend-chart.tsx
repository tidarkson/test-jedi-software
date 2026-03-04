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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PassRateTrend } from '@/types'

interface PassRateTrendChartProps {
  data: PassRateTrend[]
  title?: string
  description?: string
  height?: number
}

const chartConfig = {
  passRate: {
    label: 'Pass Rate',
    theme: {
      light: '#10b981',
      dark: '#34d399',
    },
  },
}

export function PassRateTrendChart({
  data,
  title = 'Pass Rate Trend',
  description = 'Pass rate over time',
  height = 300,
}: PassRateTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-96 w-full">
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
                domain={[0, 100]}
                label={{ value: 'Pass Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                content={<ChartTooltipContent />}
                cursor={{ strokeDasharray: '3 3' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="passRate"
                stroke="var(--color-passRate)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-passRate)', r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
