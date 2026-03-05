'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SuiteHealthScore } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface SuiteHealthScoreTableProps {
  data: SuiteHealthScore[]
  className?: string
}

function getHealthScoreBadge(score: number) {
  if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
  if (score >= 60) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
  if (score >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
  return <Badge className="bg-red-100 text-red-800">Poor</Badge>
}

function getHealthScoreColor(score: number) {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

export function SuiteHealthScoreTable({
  data,
  className,
}: SuiteHealthScoreTableProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Suite Health Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <p className="text-sm">No suite health data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const sortedData = [...data].sort((a, b) => b.healthScore - a.healthScore)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Suite Health Scores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Suite</TableHead>
                <TableHead className="text-right">Cases</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead className="text-right">Pass Rate</TableHead>
                <TableHead className="text-right">Flaky Count</TableHead>
                <TableHead className="text-right">Health Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((suite) => (
                <TableRow key={suite.suiteId}>
                  <TableCell className="font-medium">{suite.suiteName}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {suite.totalCases}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(suite.lastRunDate, 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium text-green-600">
                      {suite.passRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {suite.flakyCount > 0 ? (
                      <Badge variant="outline" className="bg-yellow-50">
                        {suite.flakyCount}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-semibold ${getHealthScoreColor(suite.healthScore)}`}>
                        {suite.healthScore}
                      </span>
                      {getHealthScoreBadge(suite.healthScore)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Cases</p>
            <p className="text-lg font-semibold">
              {data.reduce((sum, s) => sum + s.totalCases, 0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Pass Rate</p>
            <p className="text-lg font-semibold text-green-600">
              {Math.round(data.reduce((sum, s) => sum + s.passRate, 0) / data.length)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Flaky</p>
            <p className="text-lg font-semibold text-yellow-600">
              {data.reduce((sum, s) => sum + s.flakyCount, 0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Health Score</p>
            <p className="text-lg font-semibold text-blue-600">
              {Math.round(data.reduce((sum, s) => sum + s.healthScore, 0) / data.length)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
