import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  XCircle,
  Ban,
  RefreshCw,
  SkipForward,
  Minus,
  Clock,
} from 'lucide-react'
import type { TestStatus } from '@/types'

// Status color configurations using CSS variables
const statusStyles: Record<TestStatus, { bg: string; text: string; border: string }> = {
  passed: {
    bg: 'var(--status-passed-bg)',
    text: 'var(--status-passed-text)',
    border: 'var(--status-passed-border)',
  },
  failed: {
    bg: 'var(--status-failed-bg)',
    text: 'var(--status-failed-text)',
    border: 'var(--status-failed-border)',
  },
  blocked: {
    bg: 'var(--status-blocked-bg)',
    text: 'var(--status-blocked-text)',
    border: 'var(--status-blocked-border)',
  },
  retest: {
    bg: 'var(--status-retest-bg)',
    text: 'var(--status-retest-text)',
    border: 'var(--status-retest-border)',
  },
  skipped: {
    bg: 'var(--status-skipped-bg)',
    text: 'var(--status-skipped-text)',
    border: 'var(--status-skipped-border)',
  },
  na: {
    bg: 'var(--status-na-bg)',
    text: 'var(--status-na-text)',
    border: 'var(--status-na-border)',
  },
  deferred: {
    bg: 'var(--status-deferred-bg)',
    text: 'var(--status-deferred-text)',
    border: 'var(--status-deferred-border)',
  },
}

const sizeClasses = {
  sm: 'h-5 text-[10px] px-1.5',
  md: 'h-6 text-xs px-2',
  lg: 'h-7 text-sm px-2.5',
}

const statusIcons: Record<TestStatus, React.ElementType> = {
  passed: CheckCircle2,
  failed: XCircle,
  blocked: Ban,
  retest: RefreshCw,
  skipped: SkipForward,
  na: Minus,
  deferred: Clock,
}

const statusLabels: Record<TestStatus, string> = {
  passed: 'Passed',
  failed: 'Failed',
  blocked: 'Blocked',
  retest: 'Retest',
  skipped: 'Skipped',
  na: 'N/A',
  deferred: 'Deferred',
}

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: TestStatus
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showLabel?: boolean
}

export function StatusBadge({
  status,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className,
  ...props
}: StatusBadgeProps) {
  const Icon = statusIcons[status]
  const label = statusLabels[status]
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14
  const styles = statusStyles[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-medium transition-colors',
        sizeClasses[size],
        className
      )}
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
        borderColor: styles.border,
      }}
      {...props}
    >
      {showIcon && <Icon className="flex-shrink-0" size={iconSize} />}
      {showLabel && <span>{label}</span>}
    </span>
  )
}

// Status dot icon colors using CSS variables
const statusDotColors: Record<TestStatus, string> = {
  passed: 'var(--status-passed-icon)',
  failed: 'var(--status-failed-icon)',
  blocked: 'var(--status-blocked-icon)',
  retest: 'var(--status-retest-icon)',
  skipped: 'var(--status-skipped-icon)',
  na: 'var(--status-na-icon)',
  deferred: 'var(--status-deferred-icon)',
}

// Status dot for compact views
export function StatusDot({
  status,
  className,
}: {
  status: TestStatus
  className?: string
}) {
  return (
    <span
      className={cn('inline-block h-2 w-2 rounded-full', className)}
      style={{ backgroundColor: statusDotColors[status] }}
      title={statusLabels[status]}
    />
  )
}
