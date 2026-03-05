'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SuiteHealthHeatmap } from '@/types'
import { cn } from '@/lib/utils'

interface SuiteHealthHeatmapChartProps {
  data: SuiteHealthHeatmap[]
  className?: string
}

function getColorForFailures(failures: number, maxFailures: number) {
  if (failures === 0) return '#10b981' // green
  if (maxFailures === 0) return '#10b981'
  
  const ratio = failures / maxFailures
  
  if (ratio <= 0.2) return '#86efac' // light green
  if (ratio <= 0.4) return '#fcd34d' // yellow
  if (ratio <= 0.6) return '#fb923c' // orange
  if (ratio <= 0.8) return '#f87171' // light red
  return '#ef4444' // red
}

export function SuiteHealthHeatmapChart({
  data,
  className,
}: SuiteHealthHeatmapChartProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Suite Health Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <p className="text-sm">No suite health data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate max failures for color scaling
  const maxFailures = Math.max(
    ...data.flatMap((suite) => suite.failuresByWeek)
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Suite Health Heatmap (12 Weeks)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 overflow-x-auto">
          <div className="min-w-max">
            {/* Header row with weeks */}
            <div className="flex gap-1 mb-2">
              <div className="w-32 text-xs font-medium text-muted-foreground"></div>
              {data[0]?.weekLabels.map((week) => (
                <div key={week} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {week}
                </div>
              ))}
            </div>

            {/* Suite rows */}
            {data.map((suite) => (
              <div key={suite.suiteId} className="flex gap-1 mb-1">
                <div className="w-32 text-xs font-medium truncate flex items-center">
                  {suite.suiteName}
                </div>
                {suite.failuresByWeek.map((failures, idx) => (
                  <div
                    key={`${suite.suiteId}-${idx}`}
                    className="w-8 h-8 rounded cursor-pointer flex items-center justify-center text-xs font-semibold text-white hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: getColorForFailures(failures, maxFailures),
                    }}
                    title={`${suite.suiteName} - ${suite.weekLabels[idx]}: ${failures} failures`}
                  >
                    {failures > 0 ? failures : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
              <span>0 failures</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#86efac' }}></div>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fcd34d' }}></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fb923c' }}></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
