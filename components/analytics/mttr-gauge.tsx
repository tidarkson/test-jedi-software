'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MTTRMetrics } from '@/types'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface MTTRGaugeProps {
  data: MTTRMetrics
  className?: string
}

export function MTTRGauge({ data, className }: MTTRGaugeProps) {
  const percentage = Math.min(100, (data.current / 40) * 100)
  const getColor = () => {
    if (data.current <= 12) return 'text-green-600'
    if (data.current <= 24) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = () => {
    if (data.current <= 12) return 'bg-green-600'
    if (data.current <= 24) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  const getTrendIcon = () => {
    if (data.trend === 'up') {
      return <ArrowUp className="h-4 w-4 text-red-600" />
    }
    if (data.trend === 'down') {
      return <ArrowDown className="h-4 w-4 text-green-600" />
    }
    return null
  }

  const getTrendLabel = () => {
    if (data.trend === 'up') return 'Increasing'
    if (data.trend === 'down') return 'Improving'
    return 'Stable'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>MTTR (Mean Time to Resolve)</span>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <Badge variant="outline" className="bg-muted">
              {getTrendLabel()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gauge Display */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-40 h-40">
            {/* Circular gauge */}
            <svg className="w-full h-full" viewBox="0 0 120 120">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted-foreground/20"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(percentage / 100) * 314} 314`}
                className={getProgressColor().replace('bg-', 'text-')}
                strokeLinecap="round"
                pathLength="100"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-3xl font-bold ${getColor()}`}>
                {data.current}h
              </div>
              <div className="text-xs text-muted-foreground">Current MTTR</div>
            </div>
          </div>

          {/* Status indicator */}
          <div className="text-center">
            {data.current <= 12 && (
              <p className="text-sm text-green-600 font-medium">
                ✓ Good - Within target
              </p>
            )}
            {data.current > 12 && data.current <= 24 && (
              <p className="text-sm text-yellow-600 font-medium">
                ⚠ Acceptable - Needs attention
              </p>
            )}
            {data.current > 24 && (
              <p className="text-sm text-red-600 font-medium">
                ✗ Critical - Immediate action needed
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Average MTTR</p>
            <p className="text-lg font-semibold">{data.average}h</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Trend</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              {getTrendLabel()}
              {getTrendIcon()}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs text-blue-800">
            <span className="font-medium">ℹ MTTR Benchmarks:</span> Green ≤12h, Yellow 12-24h, Red &gt;24h
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
