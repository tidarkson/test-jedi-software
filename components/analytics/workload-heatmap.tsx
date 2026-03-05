'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkloadHeatmap } from '@/types'

interface WorkloadHeatmapChartProps {
  data: WorkloadHeatmap[]
  className?: string
}

function getColorForWorkload(executions: number, maxExecutions: number) {
  if (executions === 0) return '#f3f4f6' // light gray
  if (maxExecutions === 0) return '#f3f4f6'
  
  const ratio = executions / maxExecutions
  
  if (ratio <= 0.2) return '#dbeafe' // light blue
  if (ratio <= 0.4) return '#bfdbfe' // lighter blue
  if (ratio <= 0.6) return '#93c5fd' // blue
  if (ratio <= 0.8) return '#3b82f6' // darker blue
  return '#1e40af' // darkest blue
}

export function WorkloadHeatmapChart({
  data,
  className,
}: WorkloadHeatmapChartProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Tester Workload Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <p className="text-sm">No workload data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate max executions for color scaling
  const maxExecutions = Math.max(
    ...data.flatMap((tester) => tester.executionByDay)
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Tester Workload Heatmap (Weekly)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 overflow-x-auto">
          <div className="min-w-max">
            {/* Header row with days */}
            <div className="flex gap-1 mb-2">
              <div className="w-32 text-xs font-medium text-muted-foreground"></div>
              {data[0]?.dayLabels.map((day) => (
                <div key={day} className="w-10 h-8 flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Tester rows */}
            {data.map((tester) => (
              <div key={tester.testerId} className="flex gap-1 mb-1">
                <div className="w-32 text-xs font-medium truncate flex items-center">
                  {tester.testerName}
                </div>
                {tester.executionByDay.map((executions, idx) => (
                  <div
                    key={`${tester.testerId}-${idx}`}
                    className="w-10 h-8 rounded cursor-pointer flex items-center justify-center text-xs font-semibold text-gray-700 hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: getColorForWorkload(executions, maxExecutions),
                    }}
                    title={`${tester.testerName} - ${tester.dayLabels[idx]}: ${executions} test cases`}
                  >
                    {executions}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t text-xs flex-wrap">
            <span className="text-muted-foreground">Execution Load:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f3f4f6' }}></div>
              <span>0</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dbeafe' }}></div>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#93c5fd' }}></div>
              <span>Med</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1e40af' }}></div>
              <span>Max</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
