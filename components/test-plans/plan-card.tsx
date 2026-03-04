'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TestPlan } from '@/types'
import { ReadinessGauge } from './readiness-gauge'
import { ArrowRight, LinkIcon } from 'lucide-react'

interface PlanCardProps {
  plan: TestPlan
}

export function PlanCard({ plan }: PlanCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-700 hover:bg-green-200'
      case 'deprecated':
        return 'bg-red-100 text-red-700 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <Link href={`/test-plans/${plan.id}`}>
      <Card className="group h-full cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="line-clamp-2 text-lg font-semibold group-hover:text-primary">
                {plan.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {plan.description || 'No description'}
              </p>
            </div>
            <Badge className={getStatusColor(plan.status)}>
              {getStatusLabel(plan.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Version</p>
              <p className="font-semibold">v{plan.version}</p>
            </div>
            {plan.milestone && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">Milestone</p>
                <p className="font-semibold">{plan.milestone}</p>
              </div>
            )}
          </div>

          {/* Pass Rate Gauge */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Pass Rate</p>
            <div className="flex items-center gap-3">
              <Progress value={plan.passRate} className="flex-1" />
              <span className="min-w-12 text-right text-sm font-bold">
                {plan.passRate}%
              </span>
            </div>
          </div>

          {/* Readiness Score */}
          <div className="flex items-center justify-between rounded-lg bg-accent/50 p-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Readiness Score
              </p>
              <p className="text-lg font-bold">{plan.readinessScore}</p>
            </div>
            <ReadinessGauge
              score={plan.readinessScore}
              size="sm"
              showLabel={false}
            />
          </div>

          {/* Linked Runs Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LinkIcon className="h-4 w-4" />
            <span>
              {plan.linkedRuns.length}{' '}
              {plan.linkedRuns.length === 1 ? 'linked run' : 'linked runs'}
            </span>
          </div>

          {/* Tags */}
          {plan.tags && plan.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {plan.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end pt-2 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View details <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
