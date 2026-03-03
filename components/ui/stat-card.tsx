import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  icon?: React.ReactNode
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
}: StatCardProps) {
  const trendColor = {
    up: 'text-success-600',
    down: 'text-error-600',
    neutral: 'text-muted-foreground',
  }

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary dark:bg-primary-100">
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div className={cn('mt-3 flex items-center gap-1 text-xs', trendColor[trend.direction])}>
            {React.createElement(TrendIcon[trend.direction], { className: 'h-3 w-3' })}
            <span className="font-medium">{Math.abs(trend.value)}%</span>
            {trend.label && <span className="text-muted-foreground">{trend.label}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
