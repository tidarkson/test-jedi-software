'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { TesterPerformance } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle2 } from 'lucide-react'

interface TesterPerformanceTableProps {
  testers: TesterPerformance[]
  className?: string
}

export function TesterPerformanceTable({
  testers,
  className,
}: TesterPerformanceTableProps) {
  const sortedTesters = React.useMemo(
    () => [...testers].sort((a, b) => b.passRate - a.passRate),
    [testers]
  )

  const getTesterStats = () => {
    if (testers.length === 0) return { avgPassRate: 0, avgTime: 0 }
    const avgPassRate =
      testers.reduce((sum, t) => sum + t.passRate, 0) / testers.length
    const avgTime =
      testers.reduce((sum, t) => sum + t.avgTimePerCase, 0) / testers.length
    return { avgPassRate, avgTime }
  }

  const stats = getTesterStats()

  const getPerformanceColor = (passRate: number, avgRate: number) => {
    if (passRate > avgRate + 5) return 'text-green-600 font-semibold'
    if (passRate < avgRate - 5) return 'text-red-600 font-semibold'
    return 'text-gray-600'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tester Performance</span>
          <span className="text-xs font-normal text-muted-foreground">
            {testers.length} testers
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Tester</TableHead>
                <TableHead className="text-center w-24">Assigned</TableHead>
                <TableHead className="text-center w-24">Completed</TableHead>
                <TableHead className="w-32">Pass Rate</TableHead>
                <TableHead className="text-center">Avg Time/Case</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTesters.map((tester) => {
                const completionPercentage = tester.assigned > 0 
                  ? (tester.completed / tester.assigned) * 100 
                  : 0
                const performanceColor = getPerformanceColor(tester.passRate, stats.avgPassRate)

                return (
                  <TableRow
                    key={tester.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs font-semibold">
                            {tester.avatar || tester.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-sm">{tester.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {tester.completed}/{tester.assigned} completed
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-semibold">
                        {tester.assigned}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">{tester.completed}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={cn('text-sm font-medium', performanceColor)}>
                            {tester.passRate.toFixed(1)}%
                          </span>
                          {tester.passRate > stats.avgPassRate && (
                            <span className="text-xs text-green-600 font-semibold">
                              +{(tester.passRate - stats.avgPassRate).toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <Progress
                          value={tester.passRate}
                          className="h-1.5"
                          style={{
                            backgroundColor: 'var(--color-bg)',
                          }}
                        />
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {tester.avgTimePerCase.toFixed(1)}m
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary Footer */}
        {testers.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Assigned</p>
              <p className="text-lg font-bold">
                {testers.reduce((sum, t) => sum + t.assigned, 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Total Completed</p>
              <p className="text-lg font-bold">
                {testers.reduce((sum, t) => sum + t.completed, 0)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Avg Pass Rate</p>
              <p className="text-lg font-bold text-green-600">
                {stats.avgPassRate.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {testers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No tester performance data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
