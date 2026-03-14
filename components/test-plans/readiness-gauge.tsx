'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ReadinessGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ReadinessGauge({
  score,
  size = 'md',
  showLabel = true,
  className,
}: ReadinessGaugeProps) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score || 0)))

  const getColor = (score: number) => {
    if (score < 40) return 'from-red-500 to-red-600'
    if (score < 70) return 'from-orange-500 to-orange-600'
    return 'from-green-500 to-green-600'
  }

  const getStatusText = (score: number) => {
    if (score < 40) return 'Not Ready'
    if (score < 70) return 'Approaching Ready'
    return 'Ready'
  }

  const sizeConfig = {
    sm: { outer: 100, inner: 80, fontSize: 'text-lg' },
    md: { outer: 140, inner: 112, fontSize: 'text-2xl' },
    lg: { outer: 180, inner: 144, fontSize: 'text-3xl' },
  }

  const config = sizeConfig[size]
  const circumference = 2 * Math.PI * 44
  const strokeDashoffset = circumference - ((normalizedScore / 100) * circumference)

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="relative inline-flex items-center justify-center">
        {/* Background circle */}
        <svg
          width={config.outer}
          height={config.outer}
          className="absolute -rotate-90"
        >
          <circle
            cx={config.outer / 2}
            cy={config.outer / 2}
            r={44}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
        </svg>

        {/* Progress circle */}
        <svg
          width={config.outer}
          height={config.outer}
          className="absolute -rotate-90 drop-shadow-md"
        >
          <defs>
            <linearGradient
              id={`gradient-${normalizedScore}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={getColor(normalizedScore).split(' ')[0].replace('from-', '')}
              />
              <stop
                offset="100%"
                stopColor={getColor(normalizedScore).split(' ')[1].replace('to-', '')}
              />
            </linearGradient>
          </defs>
          <circle
            cx={config.outer / 2}
            cy={config.outer / 2}
            r={44}
            stroke={`url(#gradient-${normalizedScore})`}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>

        {/* Center content */}
        <div className="flex flex-col items-center gap-1">
          <div className={cn('font-bold', config.fontSize)}>{normalizedScore}</div>
          <div className="text-xs text-muted-foreground">%</div>
        </div>
      </div>

      {showLabel && (
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            {getStatusText(normalizedScore)}
          </p>
        </div>
      )}
    </div>
  )
}
