'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TesterLeaderboardEntry } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trophy, Award, Zap } from 'lucide-react'

interface TesterLeaderboardTableProps {
  data: TesterLeaderboardEntry[]
  className?: string
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <Badge className="bg-yellow-100 text-yellow-800">1st</Badge>
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-gray-400" />
        <Badge className="bg-gray-100 text-gray-800">2nd</Badge>
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="flex items-center gap-2">
        <Award className="h-4 w-4 text-amber-600" />
        <Badge className="bg-amber-100 text-amber-800">3rd</Badge>
      </div>
    )
  }
  return (
    <Badge variant="outline">#{rank}</Badge>
  )
}

export function TesterLeaderboardTable({
  data,
  className,
}: TesterLeaderboardTableProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Tester Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <p className="text-sm">No tester data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Tester Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Pass Rate</TableHead>
                <TableHead className="text-right">Avg Time/Case</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((tester) => (
                <TableRow
                  key={tester.testerId}
                  className={tester.rank <= 3 ? 'bg-muted/30' : ''}
                >
                  <TableCell>{getRankBadge(tester.rank)}</TableCell>
                  <TableCell className="font-medium">{tester.testerName}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-blue-600">
                      {tester.completed}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-green-600">
                      {tester.passRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {tester.avgTimePerCase}m
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Completed</p>
            <p className="text-lg font-semibold">
              {data.reduce((sum, t) => sum + t.completed, 0)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Pass Rate</p>
            <p className="text-lg font-semibold text-green-600">
              {Math.round(data.reduce((sum, t) => sum + t.passRate, 0) / data.length)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Team Average Time</p>
            <p className="text-lg font-semibold">
              {Math.round(data.reduce((sum, t) => sum + t.avgTimePerCase, 0) / data.length)}m
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
